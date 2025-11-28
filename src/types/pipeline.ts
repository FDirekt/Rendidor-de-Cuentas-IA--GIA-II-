export type OcrResult = {
  text: string;
  confidence?: number;
};

export type ExtractionResult = {
  fields: Record<string, string>;
  model?: string;
};

export type JudgeResult = {
  status: "aprobado" | "observado";
  reason: string;
  model?: string;
};

export type IngestInput = {
  caseId: string;
  tipo: string;
  nombre: string;
  contentBase64: string;
  hash?: string;
};
