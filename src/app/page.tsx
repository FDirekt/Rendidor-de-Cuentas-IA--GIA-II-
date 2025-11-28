import Image from "next/image";
import { CaseDashboard } from "@/components/CaseDashboard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function serializeCase(c: Awaited<ReturnType<typeof prisma.case.findFirst>>) {
  if (!c) return c;
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
  const cases = casesRaw.map(serializeCase).map((c) =>
    c ? { ...c, status: c.status === "EN_PROCESO" ? "ACTIVO" : c.status } : c
  );
  const activeCount = cases.filter((c) => c.status === "ACTIVO").length;
  const finishedCount = cases.filter((c) => c.status === "TERMINADO").length;

  return (
    <main className="min-h-screen px-6 py-10 text-[color:var(--foreground)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="theme-cta rounded-3xl p-8 shadow-lg ring-1 ring-[color:var(--border)]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <Image src="/logo/logomid.png" alt="Logo Grupo 2" width={56} height={56} priority />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-200">Rendición de Cuentas</p>
                <h1 className="text-3xl font-semibold">Casos y documentos</h1>
                <p className="text-sm text-slate-200">
                  Mock operativo con usuario inventado. Seleccioná un caso, carga documentos y genera el acta final con el juez.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm shadow-inner ring-1 ring-white/10">
              <p className="text-slate-200">Usuario</p>
              <p className="text-lg font-semibold">Sofía Videla</p>
              <p className="text-xs text-slate-300">Control posterior · demo</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-slate-200">Casos activos</p>
              <p className="text-2xl font-semibold">{activeCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-slate-200">Terminados</p>
              <p className="text-2xl font-semibold">{finishedCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-slate-200">Total casos</p>
              <p className="text-2xl font-semibold">{cases.length}</p>
            </div>
          </div>
        </section>

        <CaseDashboard initialCases={cases} />
      </div>
    </main>
  );
}
