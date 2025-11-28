import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedStatus = new Set(["ACTIVO", "TERMINADO"]);

function normalizeStatus(status?: string | null) {
  if (!status) return null;
  const upper = status.toUpperCase();
  if (upper === "EN_PROCESO") return "ACTIVO";
  return allowedStatus.has(upper) ? upper : null;
}

type Params = { params: Promise<{ caseId: string }> | { caseId: string } };

function resolveParams(params: Params["params"]) {
  return params instanceof Promise ? params : Promise.resolve(params);
}

export async function GET(_: Request, { params }: Params) {
  const { caseId } = await resolveParams(params);
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      _count: { select: { documents: true } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!caseRecord) {
    return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
  }
  const normalizedStatus = caseRecord.status === "EN_PROCESO" ? "ACTIVO" : caseRecord.status;
  const normalizedCase = { ...caseRecord, status: normalizedStatus };

  const hashes = caseRecord.documents.map((d) => d.hash);
  const duplicateMatches = hashes.length
    ? await prisma.document.findMany({
        where: {
          hash: { in: hashes },
          NOT: { caseId },
        },
        select: {
          id: true,
          hash: true,
          nombre: true,
          caseId: true,
          tipo: true,
          uploadedAt: true,
        },
      })
    : [];

  return NextResponse.json({ case: normalizedCase, documents: caseRecord.documents, duplicateMatches });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { caseId } = await resolveParams(params);
  const body = (await req.json()) as Partial<{ status: string; summary: string; owner: string; name: string }>;
  const data: Prisma.CaseUpdateInput = {};

  const normalized = normalizeStatus(body.status);
  if (normalized) data.status = normalized;
  if (body.summary !== undefined) data.summary = body.summary;
  if (body.owner !== undefined) data.owner = body.owner;
  if (body.name !== undefined) data.name = body.name;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  try {
    const updated = await prisma.case.update({ where: { id: caseId }, data });
    return NextResponse.json({ case: updated });
  } catch (err) {
    console.error("PATCH /cases/:id", err);
    return NextResponse.json({ error: "No se pudo actualizar el caso" }, { status: 500 });
  }
}
