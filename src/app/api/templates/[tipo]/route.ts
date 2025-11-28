import { NextRequest, NextResponse } from "next/server";
import { renderTemplatePdf } from "@/services/pdfService";

export const runtime = "nodejs";

type Params = { params: Promise<{ tipo: string }> };

export async function POST(req: NextRequest, context: Params) {
  const { tipo } = await context.params;
  const body = await req.json();
  if (!["pagos", "devengados", "documentacion"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo no soportado" }, { status: 400 });
  }
  const pdfBuffer = await renderTemplatePdf(tipo as "pagos" | "devengados" | "documentacion", body);
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${tipo}.pdf"`,
    },
  });
}
