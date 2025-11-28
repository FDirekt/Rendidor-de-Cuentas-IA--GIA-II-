import { NextRequest, NextResponse } from "next/server";
import { runOcr } from "@/lib/ocrProvider";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { contentBase64 } = await req.json();
  if (!contentBase64) {
    return NextResponse.json({ error: "Falta contentBase64" }, { status: 400 });
  }
  const result = await runOcr({ contentBase64 });
  return NextResponse.json(result);
}
