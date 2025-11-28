import {
  DevengadosTemplatePayload,
  DocAdicionalTemplatePayload,
  PagosTemplatePayload,
} from "@/types/templates";

const baseStyles = `
  <style>
    body { font-family: Arial, sans-serif; margin: 28px; color: #0f172a; }
    h1 { font-size: 20px; margin-bottom: 12px; color: #0b5fff; }
    h2 { font-size: 16px; margin: 18px 0 8px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; vertical-align: top; }
    th { background: #f8fafc; text-transform: uppercase; letter-spacing: 0.5px; }
    .muted { color: #64748b; font-size: 11px; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-weight: 600; font-size: 11px; }
  </style>
`;

export function renderPagosTemplate(payload: PagosTemplatePayload) {
  const rows = payload.items
    .map(
      (p) => `
      <tr>
        <td>${p.numeroDevengado}</td>
        <td>${p.tipoEp}</td>
        <td>${p.planilla}</td>
        <td>${p.numeroEp}</td>
        <td>${p.cuentaDestino}</td>
        <td>${p.numeroLiquidacion}</td>
        <td>${p.tipoPago}</td>
        <td>${p.importePagado}</td>
        <td>${p.validacionInterbanking ?? ""}</td>
      </tr>`
    )
    .join("");

  return `
    <html>
      <head>${baseStyles}</head>
      <body>
        <h1>${payload.titulo ?? "Planilla de Pagos"}</h1>
        <p class="muted">Caso: ${payload.caseId}</p>
        <table>
          <thead>
            <tr>
              <th>Nro Devengado</th>
              <th>Tipo EP</th>
              <th>Planilla</th>
              <th>Nro EP</th>
              <th>Cuenta destino</th>
              <th>Nro liquidación</th>
              <th>Tipo pago</th>
              <th>Importe pagado/ret.</th>
              <th>Validación interbanking</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
}

export function renderDevengadosTemplate(payload: DevengadosTemplatePayload) {
  const rows = payload.items
    .map(
      (d) => `
      <tr>
        <td>${d.duee}</td>
        <td>${d.numero}</td>
        <td>${d.descripcion}</td>
        <td>${d.numeroComprobante}</td>
        <td>${d.proveedor}</td>
        <td>${d.totalDevengado}</td>
        <td>${d.importeActual}</td>
        <td>${d.importeAnterior}</td>
        <td>${d.importePendiente}</td>
        <td>${d.validadoAfip ? "Sí" : "No"}</td>
      </tr>`
    )
    .join("");

  const docs =
    payload.documentos && payload.documentos.length > 0
      ? `
        <h2>Documentos asociados</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Observación</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody>
            ${payload.documentos
              .map(
                (doc) => `
              <tr>
                <td>${doc.nombre}</td>
                <td>${doc.tipoDocumento}</td>
                <td>${doc.observacion ?? ""}</td>
                <td>${doc.hash}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `
      : "";

  return `
    <html>
      <head>${baseStyles}</head>
      <body>
        <h1>${payload.titulo ?? "Detalle de Devengados"}</h1>
        <p class="muted">Caso: ${payload.caseId}</p>
        <table>
          <thead>
            <tr>
              <th>DUEE/INT</th>
              <th>Nro Devengado</th>
              <th>Descripción</th>
              <th>Nro Comprobante</th>
              <th>Proveedor</th>
              <th>Total devengado</th>
              <th>Rendición actual</th>
              <th>Rendición anterior</th>
              <th>Pendiente</th>
              <th>Validado AFIP</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${docs}
      </body>
    </html>
  `;
}

export function renderDocAdicionalTemplate(payload: DocAdicionalTemplatePayload) {
  const rows = payload.documentos
    .map(
      (d) => `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.tipoDocumento}</td>
        <td>${d.observacion ?? ""}</td>
        <td>${d.hash}</td>
      </tr>`
    )
    .join("");

  return `
    <html>
      <head>${baseStyles}</head>
      <body>
        <h1>${payload.titulo ?? "Documentación Adicional"}</h1>
        <p class="muted">Caso: ${payload.caseId}</p>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo documento</th>
              <th>Observación</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
}
