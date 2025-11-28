export type DocumentType = "Pagos" | "Devengados" | "DocumentacionAdicional";

export type UploadDocumentInput = {
  caseId: string;
  tipo: DocumentType;
  nombre: string;
  contentBase64: string;
  hash?: string;
};
