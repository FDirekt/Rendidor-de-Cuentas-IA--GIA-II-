import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UploadDocumentInput } from "@/types/documents";
import { ingestDocument } from "@/services/ingest";

export const runtime = "nodejs";

export async function GET() {
  const docs = await prisma.document.findMany({
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json({ documents: docs });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as UploadDocumentInput;
  const required = ["caseId", "tipo", "nombre"];
  for (const field of required) {
    if (!(body as Record<string, unknown>)[field]) {
      return NextResponse.json(
        { error: `Falta campo requerido: ${field}` },
        { status: 400 }
      );
    }
  }
  if (!body.contentBase64) {
    // Permitir carga manual sin archivo: crear base64 a partir de datos manuales o nombre
    const manualFields = (body as Record<string, unknown>).manualFields;
    const manualSource =
      manualFields !== undefined
        ? JSON.stringify(manualFields)
        : body.nombre ?? "manual-entry";
    body.contentBase64 = Buffer.from(manualSource).toString("base64");
  }

  const created = await ingestDocument(body);
  return NextResponse.json(created, { status: 201 });
}
