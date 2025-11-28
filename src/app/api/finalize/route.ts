import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { caseId } = await req.json();
  if (!caseId) {
    return NextResponse.json({ error: "Falta caseId" }, { status: 400 });
  }

  const docs = await prisma.document.findMany({ where: { caseId } });
  if (!docs.length) {
    return NextResponse.json({ error: "No hay documentos para este caso" }, { status: 400 });
  }

  // Duplicados por hash en otros casos
  const hashes = docs.map((d) => d.hash);
  const duplicates = await prisma.document.findMany({
    where: { hash: { in: hashes }, NOT: { caseId } },
  });

  const pdf = await renderFinalSummary(caseId, docs, duplicates);
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="final_${caseId}.pdf"`,
    },
  });
}

async function renderFinalSummary(
  caseId: string,
  docs: { nombre: string; tipo: string; hash: string; duplicateOfId: string | null; duplicateOfCaseId: string | null }[],
  duplicates: { hash: string; caseId: string; id: string }[]
) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4 portrait
  const font = await doc.embedFont(StandardFonts.Helvetica);
  let y = 800;

  const write = (text: string, size = 12, color = rgb(0, 0, 0), dy = 16) => {
    page.drawText(text, { x: 40, y, size, font, color });
    y -= dy;
  };

  write("Resumen de Rendición - Caso " + caseId, 18, rgb(0.05, 0.35, 0.8), 22);
  write(`Documentos: ${docs.length}`, 12, rgb(0.2, 0.2, 0.2));
  write(`Duplicados detectados (hash en otros casos): ${duplicates.length}`, 12, rgb(0.2, 0.2, 0.2), 20);

  write("Documentos:", 12, rgb(0.1, 0.1, 0.1), 18);
  docs.forEach((d) => {
    write(`- ${d.nombre} (${d.tipo})`, 11, rgb(0, 0, 0));
    write(`  Hash: ${d.hash}`, 10, rgb(0.2, 0.2, 0.2), 14);
    if (d.duplicateOfId) {
      write(`  Duplicado de ${d.duplicateOfId} en caso ${d.duplicateOfCaseId}`, 10, rgb(0.7, 0.4, 0.1), 14);
    } else {
      y -= 4;
    }
  });

  if (duplicates.length) {
    write("Duplicados en otros casos:", 12, rgb(0.6, 0.3, 0.1), 18);
    duplicates.forEach((d) => {
      write(`- Hash ${d.hash} en caso ${d.caseId} (doc ${d.id})`, 10, rgb(0.6, 0.3, 0.1), 14);
    });
  }

  return doc.save();
}
