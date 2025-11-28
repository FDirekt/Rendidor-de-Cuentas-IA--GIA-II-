import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ caseId: string }> | { caseId: string } };

function resolveParams(params: Params["params"]) {
  return params instanceof Promise ? params : Promise.resolve(params);
}

export async function GET(_: Request, { params }: Params) {
  const { caseId } = await resolveParams(params);
  const data = await prisma.document.findMany({
    where: { caseId },
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json({ caseId, documents: data });
}
