import { NextResponse } from "next/server";
import { mockTramite } from "@/lib/mockData";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(mockTramite);
}
