import { NextRequest, NextResponse } from "next/server";
import { runJudgeLLM } from "@/lib/llmProvider";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { extraction } = await req.json();
  if (!extraction || typeof extraction !== "object") {
    return NextResponse.json({ error: "Falta extraction" }, { status: 400 });
  }
  const result = await runJudgeLLM(extraction as Record<string, string>);
  return NextResponse.json(result);
}
