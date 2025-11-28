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

export async function GET() {
  const casesRaw = await prisma.case.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { documents: true } },
      documents: { orderBy: { uploadedAt: "desc" }, take: 2 },
    },
  });
  const cases = casesRaw.map((c) => ({ ...c, status: c.status === "EN_PROCESO" ? "ACTIVO" : c.status }));
  return NextResponse.json({ cases });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<{ id: string; name: string; owner: string; summary: string; status: string }>;
  if (!body.name) {
    return NextResponse.json(
      { error: "Falta 'name' para el caso" },
      { status: 400 }
    );
  }

  const payload: Prisma.CaseCreateInput = {
    name: body.name,
    owner: body.owner ?? "Usuario demo",
    summary: body.summary ?? "Caso nuevo sin descripción",
    status: normalizeStatus(body.status) ?? "ACTIVO",
  };

  if (body.id) {
    payload.id = body.id;
  }

  const created = await prisma.case.create({ data: payload });
  return NextResponse.json({ case: created }, { status: 201 });
}
