import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> | { id: string } };

function resolveParams(params: Params["params"]) {
  return params instanceof Promise ? params : Promise.resolve(params);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await resolveParams(params);
  const doc = await prisma.document.findUnique({
    where: { id },
    select: { id: true, caseId: true, case: { select: { status: true } } },
  });

  if (!doc) {
    return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
  }

  const status = doc.case.status === "EN_PROCESO" ? "ACTIVO" : doc.case.status;
  if (status !== "ACTIVO") {
    return NextResponse.json({ error: "Solo se puede eliminar si el caso está Activo" }, { status: 400 });
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
