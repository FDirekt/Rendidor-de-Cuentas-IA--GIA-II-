import { NextResponse } from "next/server";
import { mockTramite } from "@/lib/mockData";

export const runtime = "nodejs";

export async function POST() {
  // Stub: in el MVP real, acá se arma el HTML y se genera el PDF (Puppeteer/PDFKit).
  return NextResponse.json({
    status: "ok",
    message: "Generación de PDF pendiente de implementación.",
    previewData: mockTramite,
  });
}
