import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseWorkspace } from "./CaseWorkspace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function serializeDocs<T extends { uploadedAt: Date }>(items: T[]) {
  return items.map((item) => ({ ...item, uploadedAt: item.uploadedAt.toISOString() }));
}

type PageProps = { params: Promise<{ caseId: string }> | { caseId: string } };

export default async function CasePage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  if (!resolvedParams?.caseId) notFound();

  const caseRecord = await prisma.case.findUnique({
    where: { id: resolvedParams.caseId },
    include: { documents: { orderBy: { uploadedAt: "desc" } } },
  });

  if (!caseRecord) notFound();
  const normalizedStatus = caseRecord.status === "EN_PROCESO" ? "ACTIVO" : caseRecord.status;

  const hashes = caseRecord.documents.map((d) => d.hash);
  const duplicateMatchesRaw = hashes.length
    ? await prisma.document.findMany({
        where: { hash: { in: hashes }, NOT: { caseId: caseRecord.id } },
        select: { id: true, nombre: true, hash: true, tipo: true, caseId: true, uploadedAt: true },
      })
    : [];

  const documents = serializeDocs(caseRecord.documents);
  const duplicateMatches = serializeDocs(duplicateMatchesRaw);
  const duplicatesInCase = (() => {
    const hashCounts = new Map<string, number>();
    for (const doc of documents) {
      hashCounts.set(doc.hash, (hashCounts.get(doc.hash) ?? 0) + 1);
    }
    let total = 0;
    for (const count of hashCounts.values()) {
      if (count > 1) total += count - 1;
    }
    return total;
  })();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-6 py-10 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/80 dark:ring-slate-700">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">Caso {caseRecord.id}</p>
              <h1 className="text-2xl font-bold text-slate-900">{caseRecord.name}</h1>
              <p className="text-sm text-slate-600">{caseRecord.summary ?? "Caso sin descripción"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
              >
                Volver a inicio
              </Link>
              <span
                className={`rounded-full px-3 py-2 text-xs font-semibold ${
                  normalizedStatus === "TERMINADO" ? "bg-emerald-100 text-emerald-800" : "bg-emerald-50 text-emerald-800"
                }`}
              >
                {normalizedStatus}
              </span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs uppercase text-slate-500">Documentos</p>
              <p className="text-2xl font-semibold text-slate-900">{documents.length}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
              <p className="text-xs uppercase text-amber-700">Duplicados internos</p>
              <p className="text-2xl font-semibold text-amber-900">{duplicatesInCase}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
              <p className="text-xs uppercase text-sky-700">Coincidencias en otros casos</p>
              <p className="text-2xl font-semibold text-sky-900">{duplicateMatches.length}</p>
            </div>
          </div>
        </header>

        <CaseWorkspace
          caseId={caseRecord.id}
          caseName={caseRecord.name}
          summary={caseRecord.summary}
          initialStatus={normalizedStatus}
          initialDocs={documents}
          initialDuplicateMatches={duplicateMatches}
        />
      </div>
    </main>
  );
}
