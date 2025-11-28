import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  DevengadosTemplatePayload,
  DocAdicionalTemplatePayload,
  PagosTemplatePayload,
} from "@/types/templates";

const PAGE_WIDTH = 842; // A4 landscape width in points
const PAGE_HEIGHT = 595; // A4 landscape height in points
const MARGIN_X = 40;
const MARGIN_Y = 40;

export async function renderTemplatePdf(
  tipo: "pagos" | "devengados" | "documentacion",
  body: unknown
) {
  switch (tipo) {
    case "pagos":
      return renderPagosPdf(body as PagosTemplatePayload);
    case "devengados":
      return renderDevengadosPdf(body as DevengadosTemplatePayload);
    case "documentacion":
      return renderDocAdicionalPdf(body as DocAdicionalTemplatePayload);
    default:
      throw new Error("Tipo no soportado");
  }
}

async function renderPagosPdf(payload: PagosTemplatePayload) {
  const { doc, page, font } = await createDocPage();
  const { height } = page.getSize();
  let y = height - MARGIN_Y;

  y = drawHeading(page, font, payload.titulo ?? "Planilla de Pagos", y);
  y = drawSub(page, font, `Caso: ${payload.caseId}`, y);
  drawTable(
    page,
    font,
    ["Nro Devengado", "Tipo EP", "Planilla", "Nro EP", "Cuenta destino", "Nro liquidación", "Tipo pago", "Importe", "Validación"],
    payload.items.map((p) => [
      p.numeroDevengado,
      p.tipoEp,
      p.planilla,
      p.numeroEp,
      p.cuentaDestino,
      p.numeroLiquidacion,
      p.tipoPago,
      p.importePagado,
      p.validacionInterbanking ?? "",
    ]),
    y - 10,
    [90, 60, 65, 75, 230, 70, 80, 80, 70],
    2
  );

  return doc.save();
}

async function renderDevengadosPdf(payload: DevengadosTemplatePayload) {
  const { doc, page, font } = await createDocPage();
  const { height } = page.getSize();
  let y = height - MARGIN_Y;

  y = drawHeading(page, font, payload.titulo ?? "Detalle de Devengados", y);
  y = drawSub(page, font, `Caso: ${payload.caseId}`, y);
  y = drawTable(
    page,
    font,
    ["DUEE/INT", "Nro Dev", "Descripción", "Nro Comprobante", "Proveedor", "Total", "Rendición actual", "Rendición anterior", "Pendiente", "AFIP"],
    payload.items.map((d) => [
      d.duee,
      d.numero,
      d.descripcion,
      d.numeroComprobante,
      d.proveedor,
      d.totalDevengado,
      d.importeActual,
      d.importeAnterior,
      d.importePendiente,
      d.validadoAfip ? "Sí" : "No",
    ]),
    y - 10
  );

  if (payload.documentos && payload.documentos.length) {
    y -= payload.items.length * 18 + 50;
    y = drawSub(page, font, "Documentos asociados", y);
    drawTable(
      page,
      font,
      ["Nombre", "Tipo", "Observación", "Hash"],
      payload.documentos.map((doc) => [
        doc.nombre,
        doc.tipoDocumento,
        doc.observacion ?? "",
        doc.hash,
      ]),
      y - 10
    );
  }

  return doc.save();
}

async function renderDocAdicionalPdf(payload: DocAdicionalTemplatePayload) {
  const { doc, page, font } = await createDocPage();
  const { height } = page.getSize();
  let y = height - MARGIN_Y;

  y = drawHeading(page, font, payload.titulo ?? "Documentación Adicional", y);
  y = drawSub(page, font, `Caso: ${payload.caseId}`, y);
  drawTable(
    page,
    font,
    ["Nombre", "Tipo documento", "Observación", "Hash"],
    payload.documentos.map((d) => [d.nombre, d.tipoDocumento, d.observacion ?? "", d.hash]),
    y - 10
  );
  return doc.save();
}

async function createDocPage() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]); // landscape
  const font = await doc.embedFont(StandardFonts.Helvetica);
  return { doc, page, font };
}

function drawHeading(
  page: import("pdf-lib").PDFPage,
  font: import("pdf-lib").PDFFont,
  text: string,
  y: number
) {
  page.drawText(text, { x: MARGIN_X, y, size: 16, font, color: rgb(0.05, 0.3, 0.8) });
  return y - 20;
}

function drawSub(
  page: import("pdf-lib").PDFPage,
  font: import("pdf-lib").PDFFont,
  text: string,
  y: number
) {
  page.drawText(text, { x: MARGIN_X, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
  return y - 16;
}

function drawTable(
  page: import("pdf-lib").PDFPage,
  font: import("pdf-lib").PDFFont,
  headers: string[],
  rows: string[][],
  startY: number,
  widths?: number[],
  maxLinesCap = 3
) {
  const colCount = headers.length;
  const availableWidth = page.getWidth() - MARGIN_X * 2;
  const colWidth = widths && widths.length === colCount ? widths : Array(colCount).fill(availableWidth / colCount);
  let y = startY;

  // headers
  headers.forEach((h, idx) => {
    page.drawText(h, {
      x: MARGIN_X + colWidth.slice(0, idx).reduce((a, b) => a + b, 0),
      y,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  });
  y -= 14;

  rows.forEach((row) => {
    let maxLines = 1;
    row.forEach((cell, idx) => {
      const text = String(cell ?? "");
      const width = colWidth[idx] ?? (availableWidth / colCount);
      const wrapped = wrapText(text, Math.max(6, Math.floor(width / 7)));
      const lines = Math.min(maxLinesCap, wrapped.split("\n").length);
      maxLines = Math.max(maxLines, lines);
      page.drawText(wrapped, {
        x: MARGIN_X + colWidth.slice(0, idx).reduce((a, b) => a + b, 0),
        y,
        size: 9,
        font,
        color: rgb(0, 0, 0),
        lineHeight: 12,
      });
    });
    const rowHeight = maxLines * 12 + 6;
    y -= rowHeight;
  });
  return y;
}

function wrapText(text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > max) {
      lines.push(current.trim());
      current = w;
    } else {
      current += " " + w;
    }
  }
  if (current.trim().length) lines.push(current.trim());
  return lines.join("\n");
}
