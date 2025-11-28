import { OcrResult } from "@/types/pipeline";
import { config } from "./config";

type OcrInput = { contentBase64: string };

async function runOcrStub(input: OcrInput): Promise<OcrResult> {
  return {
    text: `Texto OCR simulado desde PDF estándar (len=${input.contentBase64.length})`,
    confidence: 0.9,
  };
}

async function runOcrHttp(input: OcrInput): Promise<OcrResult> {
  if (!config.ocrHttpUrl) {
    throw new Error("OCR_HTTP_URL no configurado");
  }
  const res = await fetch(config.ocrHttpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.ocrHttpApiKey ? { Authorization: `Bearer ${config.ocrHttpApiKey}` } : {}),
    },
    body: JSON.stringify({ contentBase64: input.contentBase64 }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OCR HTTP error: ${res.status} ${text}`);
  }
  return (await res.json()) as OcrResult;
}

export async function runOcr(input: OcrInput): Promise<OcrResult> {
  switch (config.ocrProvider) {
    case "http":
      return runOcrHttp(input);
    case "stub":
    default:
      return runOcrStub(input);
  }
}
