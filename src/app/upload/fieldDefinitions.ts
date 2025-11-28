import type { TipoCamposMap } from "./types";

export const tipoCampos: TipoCamposMap = {
  Pagos: [
    { key: "numeroDevengado", label: "Nro Devengado", placeholder: "2024/039748" },
    { key: "tipoEp", label: "Tipo EP", placeholder: "MEP" },
    { key: "planilla", label: "Planilla", placeholder: "4291" },
    { key: "numeroEp", label: "Nro EP", placeholder: "2024/003918" },
    { key: "cuentaDestino", label: "Cuenta destino", placeholder: "DIAZ, LAURA ANDREA" },
    { key: "numeroLiquidacion", label: "Nro liquidación", placeholder: "0" },
    { key: "tipoPago", label: "Tipo pago", placeholder: "Proveedor" },
    { key: "importePagado", label: "Importe", placeholder: "$ 950.000,00" },
    { key: "validacionInterbanking", label: "Validación", placeholder: "OK" },
  ],
  Devengados: [
    { key: "duee", label: "DUEE/INT", placeholder: "11/34" },
    { key: "numero", label: "Nro Devengado", placeholder: "2024/039748" },
    { key: "descripcion", label: "Descripción", placeholder: "FACTURA" },
    { key: "numeroComprobante", label: "Nro Comprobante", placeholder: "00001-00000036" },
    { key: "proveedor", label: "Proveedor", placeholder: "Diaz Andrea Laura" },
    { key: "totalDevengado", label: "Total", placeholder: "$ 950.000,00" },
    { key: "importeActual", label: "Importe rendición actual", placeholder: "$ 950.000,00" },
    { key: "importeAnterior", label: "Importe rendición anterior", placeholder: "$ 0,00" },
    { key: "importePendiente", label: "Pendiente", placeholder: "$ 0,00" },
    { key: "validadoAfip", label: "Validado AFIP", placeholder: "Sí/No" },
  ],
  DocumentacionAdicional: [
    { key: "nombreDocumento", label: "Nombre documento", placeholder: "MEP 4291.pdf" },
    { key: "tipoDocumento", label: "Tipo documento", placeholder: "Planilla MEP" },
    { key: "observacion", label: "Observación", placeholder: "Pagos" },
    { key: "hash", label: "Hash", placeholder: "ABC123..." },
  ],
};
