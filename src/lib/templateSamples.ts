import {
  DevengadosTemplatePayload,
  DocAdicionalTemplatePayload,
  PagosTemplatePayload,
} from "@/types/templates";

export const samplePagos: PagosTemplatePayload = {
  caseId: "C-1",
  titulo: "Planilla de Pagos - Ejemplo",
  items: [
    {
      numeroDevengado: "2024/039748",
      tipoEp: "MEP",
      planilla: "4291",
      numeroEp: "2024/003918",
      cuentaDestino: "DIAZ, LAURA ANDREA",
      numeroLiquidacion: "0",
      tipoPago: "Proveedor",
      importePagado: "$ 950.000,00",
      validacionInterbanking: "",
    },
    {
      numeroDevengado: "2024/039654",
      tipoEp: "TRANSF.",
      planilla: "2024/001851",
      numeroEp: "2024/001851",
      cuentaDestino: "MIN. DE FINANZAS PAGOS ELECTRONICOS-AFIP-RENTAS",
      numeroLiquidacion: "0",
      tipoPago: "IVA",
      importePagado: "$ 62.700,00",
      validacionInterbanking: "",
    },
  ],
};

export const sampleDevengados: DevengadosTemplatePayload = {
  caseId: "C-1",
  titulo: "Detalle de Devengados - Ejemplo",
  items: [
    {
      duee: "11/34",
      numero: "2024/039748",
      descripcion: "FACTURA",
      numeroComprobante: "00001-00000036",
      proveedor: "Diaz Andrea Laura",
      totalDevengado: "$ 950.000,00",
      importeActual: "$ 950.000,00",
      importeAnterior: "$ 0,00",
      importePendiente: "$ 0,00",
      validadoAfip: true,
    },
    {
      duee: "11/34",
      numero: "2024/039654",
      descripcion: "FACTURA",
      numeroComprobante: "00012-00001624",
      proveedor: "NORTH COMPUTERS S.R.L.",
      totalDevengado: "$ 825.000,00",
      importeActual: "$ 825.000,00",
      importeAnterior: "$ 0,00",
      importePendiente: "$ 0,00",
      validadoAfip: true,
    },
  ],
  documentos: [
    {
      nombre: "1 OC.pdf",
      tipoDocumento: "Otros",
      observacion: "",
      hash: "34EDEBA840B3...",
    },
  ],
};

export const sampleDocAdicional: DocAdicionalTemplatePayload = {
  caseId: "C-1",
  titulo: "Documentación Adicional - Ejemplo",
  documentos: [
    {
      nombre: "MEP 4291.pdf",
      tipoDocumento: "Planilla MEP",
      observacion: "Pagos",
      hash: "CBFD23C1292F...",
    },
    {
      nombre: "LIQ 039654.pdf",
      tipoDocumento: "Planilla liquidación",
      observacion: "Pagos",
      hash: "557FBDC00...",
    },
  ],
};
