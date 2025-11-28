import { ExtractionResult, JudgeResult } from "@/types/pipeline";
import { mockTramite } from "./mockData";
import { UploadDocumentInput } from "@/types/documents";
import { config } from "./config";

async function runExtractionStub(tipo: UploadDocumentInput["tipo"]): Promise<ExtractionResult> {
  return {
    fields: {
      tipoDocumento: tipo,
      duee: mockTramite.dueeIntervencion,
      ejercicio: mockTramite.ejercicio,
      proveedor: mockTramite.devengados[0]?.proveedor ?? "",
      monto: mockTramite.importeRendido,
    },
    model: "llm-extraccion-mock",
  };
}

async function runJudgeStub(extraction: Record<string, string>): Promise<JudgeResult> {
  const knownDuee = mockTramite.dueeIntervencion;
  const status = extraction.duee === knownDuee ? "aprobado" : "observado";
  const reason =
    status === "aprobado"
      ? "Coincide con datos existentes en DB mock."
      : "No coincide DUEE con la base; requiere revisión.";
  return { status, reason, model: "llm-juez-mock" };
}

async function runExtractionOpenAI(tipo: UploadDocumentInput["tipo"]): Promise<ExtractionResult> {
  if (!config.llmOpenaiApiKey) {
    throw new Error("LLM_OPENAI_API_KEY no configurada");
  }
  const prompt = `
Devuelve JSON con los campos: tipoDocumento, duee, ejercicio, proveedor, monto.
Tipo recibido: ${tipo}.
Responde solo JSON, sin texto adicional.`;
  const res = await fetch(config.llmOpenaiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.llmOpenaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.llmOpenaiModel,
      messages: [
        { role: "system", content: "Eres un extractor de campos estructurados para rendiciones. Responde solo JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM extracción error: ${res.status} ${text}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  const fields = typeof content === "string" ? JSON.parse(content) : content;
  return { fields, model: config.llmOpenaiModel };
}

async function runJudgeOpenAI(extraction: Record<string, string>): Promise<JudgeResult> {
  if (!config.llmOpenaiApiKey) {
    throw new Error("LLM_OPENAI_API_KEY no configurada");
  }
  const prompt = `
Eres juez de validación. Revisa si la DUEE coincide con ${mockTramite.dueeIntervencion}.
Responde JSON con status ("aprobado"|"observado") y reason. Extracción: ${JSON.stringify(extraction)}.
Responde solo JSON.`;
  const res = await fetch(config.llmOpenaiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.llmOpenaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.llmOpenaiModel,
      messages: [
        { role: "system", content: "Eres un validador de rendición. Responde solo JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM juez error: ${res.status} ${text}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  const result = typeof content === "string" ? JSON.parse(content) : content;
  return { status: result.status, reason: result.reason, model: config.llmOpenaiModel };
}

export async function runExtractionLLM(tipo: UploadDocumentInput["tipo"]): Promise<ExtractionResult> {
  switch (config.llmProvider) {
    case "openai":
      return runExtractionOpenAI(tipo);
    case "stub":
    default:
      return runExtractionStub(tipo);
  }
}

export async function runJudgeLLM(extraction: Record<string, string>): Promise<JudgeResult> {
  switch (config.llmProvider) {
    case "openai":
      return runJudgeOpenAI(extraction);
    case "stub":
    default:
      return runJudgeStub(extraction);
  }
}
