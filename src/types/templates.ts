export type PagoTemplateItem = {
  numeroDevengado: string;
  tipoEp: string;
  planilla: string;
  numeroEp: string;
  cuentaDestino: string;
  numeroLiquidacion: string;
  tipoPago: string;
  importePagado: string;
  validacionInterbanking?: string;
};

export type DevengadoTemplateItem = {
  duee: string;
  numero: string;
  descripcion: string;
  numeroComprobante: string;
  proveedor: string;
  totalDevengado: string;
  importeActual: string;
  importeAnterior: string;
  importePendiente: string;
  validadoAfip: boolean;
};

export type DocAdicionalItem = {
  nombre: string;
  tipoDocumento: string;
  observacion?: string;
  hash: string;
};

export type PagosTemplatePayload = {
  caseId: string;
  titulo?: string;
  items: PagoTemplateItem[];
};

export type DevengadosTemplatePayload = {
  caseId: string;
  titulo?: string;
  items: DevengadoTemplateItem[];
  documentos?: DocAdicionalItem[];
};

export type DocAdicionalTemplatePayload = {
  caseId: string;
  titulo?: string;
  documentos: DocAdicionalItem[];
};
