import { NextRequest, NextResponse } from "next/server";
import { runExtractionLLM } from "@/lib/llmProvider";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { tipo } = await req.json();
  if (!tipo) {
    return NextResponse.json({ error: "Falta tipo" }, { status: 400 });
  }
  const result = await runExtractionLLM(tipo);
  return NextResponse.json(result);
}
