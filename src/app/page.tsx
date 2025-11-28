import Image from "next/image";
import { CaseDashboard } from "@/components/CaseDashboard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RawCaseWithDocuments = Awaited<ReturnType<typeof prisma.case.findMany>>[number];

function serializeCase(c: RawCaseWithDocuments) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    documents: c.documents?.map((d) => ({
      ...d,
      uploadedAt: d.uploadedAt.toISOString(),
    })),
  };
}

export default async function Home() {
  const casesRaw = await prisma.case.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { documents: true } }, documents: { orderBy: { uploadedAt: "desc" }, take: 2 } },
  });
  const cases = casesRaw
    .map(serializeCase)
    .map((c) => ({
      ...c,
      status: c.status === "EN_PROCESO" ? "ACTIVO" : c.status,
    }));
  const activeCount = cases.filter((c) => c.status === "ACTIVO").length;
  const finishedCount = cases.filter((c) => c.status === "TERMINADO").length;

  return (
    <main className="min-h-screen py-2 text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="home-hero rounded-3xl shadow-2xl shadow-slate-900/40">
          <div className="home-hero-content flex flex-col gap-6 rounded-3xl p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
              <Image src="/logonobg.png" alt="Logo Grupo 2" width={160} height={160} priority />
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-100">Rendición de Cuentas</p>
                <h1 className="text-3xl font-semibold">Índice de Casos</h1>
                <p className="text-sm text-slate-100/90">
                  Mock operativo con usuario estático. Seleccioná un caso, carga documentos y genera el acta final con el juez.
                </p>
              </div>
            </div>
            <div className="home-hero-stats flex flex-col gap-1 rounded-2xl px-6 py-4 text-sm">
              <p className="text-base font-semibold">Sofía Videla</p>
              <p>Casos activos: {activeCount}</p>
              <p>Terminados: {finishedCount}</p>
              <p>Total casos: {cases.length}</p>
            </div>
          </div>
        </section>

        <CaseDashboard initialCases={cases} />
      </div>
    </main>
  );
}
