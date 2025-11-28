export type TipoDoc = "Pagos" | "Devengados" | "DocumentacionAdicional";
export type UploadDocTipo = TipoDoc | string;

export type ManualFieldDef = {
  key: string;
  label: string;
  placeholder?: string;
};

export type UploadFormState = {
  caseId: string;
  tipo: TipoDoc;
  nombre: string;
  file?: File;
  manualFields: Record<string, string>;
};

export type TipoCamposMap = Record<TipoDoc, ManualFieldDef[]>;

export type DocumentRecord = {
  id: string;
  caseId: string;
  tipo: UploadDocTipo;
  nombre: string;
  hash: string;
  uploadedAt: string;
  ocrText: string;
  extraction: string;
  duplicateOfId?: string | null;
  duplicateOfCaseId?: string | null;
  judgeStatus?: string | null;
  judgeReason?: string | null;
};
