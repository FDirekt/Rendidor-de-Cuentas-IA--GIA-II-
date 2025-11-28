import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { runOcr } from "@/lib/ocrProvider";
import { runExtractionLLM, runJudgeLLM } from "@/lib/llmProvider";
import { IngestInput } from "@/types/pipeline";

function hashContent(contentBase64: string) {
  return crypto.createHash("sha256").update(contentBase64, "base64").digest("hex");
}

export async function ingestDocument(input: IngestInput) {
  const hash = input.hash ?? hashContent(input.contentBase64);

  // asegurar caso y refrescar updatedAt
  const caseRecord = await prisma.case.upsert({
    where: { id: input.caseId },
    update: { updatedAt: new Date() },
    create: { id: input.caseId, name: input.caseId, status: "ACTIVO" },
  });

  // OCR
  const ocr = await runOcr({ contentBase64: input.contentBase64 });

  // Extracción
  const extraction = await runExtractionLLM(input.tipo as "Pagos" | "Devengados" | "DocumentacionAdicional");

  // Duplicados
  const duplicate = await prisma.document.findFirst({
    where: { hash, NOT: { caseId: caseRecord.id } },
  });

  // Juez (solo si no es duplicado)
  const judge = duplicate ? null : await runJudgeLLM(extraction.fields);

  // Persistir
  const created = await prisma.document.create({
    data: {
      caseId: caseRecord.id,
      tipo: input.tipo,
      nombre: input.nombre,
      hash,
      ocrText: ocr.text,
      extraction: JSON.stringify(extraction.fields),
      duplicateOfId: duplicate?.id,
      duplicateOfCaseId: duplicate?.caseId,
      judgeStatus: judge?.status ?? null,
      judgeReason: judge?.reason ?? null,
    },
  });

  return created;
}
