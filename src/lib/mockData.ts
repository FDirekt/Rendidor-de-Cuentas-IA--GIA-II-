export type Documento = {
  nombreDocumento: string;
  tipoDocumento: string;
  observacion?: string;
  bloque: "Devengados" | "Pagos";
  hash: string;
};

export type Devengado = {
  duee: string;
  numero: string;
  descripcion: string;
  numeroComprobante: string;
  proveedor: string;
  total: string;
  importeActual: string;
  importeAnterior: string;
  importePendiente: string;
  validadoAfip: boolean;
};

export type Pago = {
  numeroDevengado: string;
  tipoEp: string;
  planilla: string;
  numeroEp: string;
  cuentaDestino: string;
  numeroLiquidacion: string;
  tipoPago: string;
  importePagado: string;
  importeRendicionActual: string;
  validacionInterbanking?: string;
};

export type Tramite = {
  numeroTramiteDigital: string;
  fecha: string;
  servicioAdministrativo: string;
  jurisdiccion: string;
  tipoRendicion: string;
  tipoTramite: string;
  dueeIntervencion: string;
  ejercicio: string;
  unidadAdministrativa: string;
  importeRendido: string;
  documentos: Documento[];
  devengados: Devengado[];
  pagos: Pago[];
  imputaciones: Array<{
    duee: string;
    numeroCompromiso: string;
    programa: string;
    subprograma: string;
    partida: string;
    importe: string;
  }>;
  totalImputaciones: string;
};

export const mockTramite: Tramite = {
  numeroTramiteDigital: "212221",
  fecha: "Córdoba, 16 de Octubre de 2024",
  servicioAdministrativo: "192 (Ministerio de Desarrollo Social y Promoción del Empleo)",
  jurisdiccion: "165 - Ministerio de Desarrollo Social y Promoción del Empleo",
  tipoRendicion: "Ordenado a Pagar",
  tipoTramite: "Otros",
  dueeIntervencion: "11/34",
  ejercicio: "2024",
  unidadAdministrativa: "192 - Ministerio de Desarrollo Social y Promoción del Empleo",
  importeRendido: "$ 1.775.000,00",
  documentos: [
    {
      nombreDocumento: "1 OC.pdf",
      tipoDocumento: "Otros",
      observacion: "",
      bloque: "Devengados",
      hash: "34EDEBA840B374F13470833397E55947040D373B10934095A3650837B605",
    },
    {
      nombreDocumento: "1 DIAZ OC 2038 P641.pdf",
      tipoDocumento: "Comprobante devengado",
      observacion: "",
      bloque: "Devengados",
      hash: "7A42E7A2E8262C8772A7049E033CDE7E15FA51854BAA02C2BC0FCEB9BB",
    },
    {
      nombreDocumento: "2 NORTH OC 2161 P641 2024039654.pdf",
      tipoDocumento: "Comprobante devengado",
      observacion: "",
      bloque: "Devengados",
      hash: "44376A61CC55CDDEA469EA2210BB91428362D308BD033CBD60C306902B5848",
    },
    {
      nombreDocumento: "2 OC.pdf",
      tipoDocumento: "Otros",
      observacion: "",
      bloque: "Devengados",
      hash: "E337D0AC76598D5BD2CBB1F3229249DA6BCE8C29FBE26E7F8AFD3A050E81",
    },
    {
      nombreDocumento: "MOV 4291.pdf",
      tipoDocumento: "Planilla de movimiento",
      observacion: "",
      bloque: "Pagos",
      hash: "9E003AF0509DC76EAA3B",
    },
  ],
  devengados: [
    {
      duee: "11/34",
      numero: "2024/039748",
      descripcion: "FACTURA",
      numeroComprobante: "00001-00000036",
      proveedor: "Diaz Andrea Laura",
      total: "$ 950.000,00",
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
      total: "$ 825.000,00",
      importeActual: "$ 825.000,00",
      importeAnterior: "$ 0,00",
      importePendiente: "$ 0,00",
      validadoAfip: true,
    },
  ],
  pagos: [
    {
      numeroDevengado: "2024/039748",
      tipoEp: "MEP",
      planilla: "4291",
      numeroEp: "2024/003918",
      cuentaDestino: "DIAZ, LAURA ANDREA",
      numeroLiquidacion: "0",
      tipoPago: "Proveedor",
      importePagado: "$ 950.000,00",
      importeRendicionActual: "$ 950.000,00",
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
      importeRendicionActual: "$ 62.700,00",
      validacionInterbanking: "",
    },
    {
      numeroDevengado: "2024/039654",
      tipoEp: "TRANSF.",
      planilla: "2024/001850",
      numeroEp: "2024/001850",
      cuentaDestino: "MIN. DE FINANZAS PAGOS ELECTRONICOS-AFIP-RENTAS",
      numeroLiquidacion: "0",
      tipoPago: "RGAN",
      importePagado: "$ 12.020,00",
      importeRendicionActual: "$ 12.020,00",
      validacionInterbanking: "",
    },
    {
      numeroDevengado: "2024/039654",
      tipoEp: "TRANSF.",
      planilla: "2024/001849",
      numeroEp: "2024/001849",
      cuentaDestino: "MIN. DE FINANZAS PAGOS ELECTRONICOS-AFIP-RENTAS",
      numeroLiquidacion: "0",
      tipoPago: "RSUSS",
      importePagado: "$ 8.250,00",
      importeRendicionActual: "$ 8.250,00",
      validacionInterbanking: "",
    },
  ],
  imputaciones: [
    {
      duee: "11/34",
      numeroCompromiso: "641",
      programa: "641",
      subprograma: "000",
      partida: "02090000",
      importe: "$ 950.000,00",
    },
    {
      duee: "11/34",
      numeroCompromiso: "641",
      programa: "641",
      subprograma: "000",
      partida: "11010000",
      importe: "$ 825.000,00",
    },
  ],
  totalImputaciones: "$ 1.775.000,00",
};
