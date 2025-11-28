export const config = {
  ocrProvider: process.env.OCR_PROVIDER ?? "stub",
  llmProvider: process.env.LLM_PROVIDER ?? "stub",
  ocrHttpUrl: process.env.OCR_HTTP_URL,
  ocrHttpApiKey: process.env.OCR_HTTP_API_KEY,
  llmOpenaiUrl: process.env.LLM_OPENAI_URL ?? "https://api.openai.com/v1/chat/completions",
  llmOpenaiModel: process.env.LLM_OPENAI_MODEL ?? "gpt-4o-mini",
  llmOpenaiApiKey: process.env.LLM_OPENAI_API_KEY,
};
