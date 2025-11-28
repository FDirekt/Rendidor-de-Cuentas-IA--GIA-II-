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
    <main className="min-h-screen px-4 py-4 text-(--foreground)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="theme-card rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-1 min-w-[220px] flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] theme-muted">Caso {caseRecord.id}</p>
              <h1 className="text-2xl font-bold theme-title">{caseRecord.name}</h1>
              <p className="text-sm theme-muted">
                {caseRecord.summary ?? "Caso sin descripción"}
              </p>
            </div>
            <div className="flex flex-1 min-w-60 justify-center">
              <div className="grid w-full max-w-lg grid-cols-3 gap-3">
                <div className="flex min-h-[90px] flex-col justify-between rounded-2xl border border-(--border) bg-(--surface-muted) px-4 py-3">
                  <p className="text-xs uppercase theme-muted">Documentos</p>
                  <p className="text-2xl font-semibold theme-title">{documents.length}</p>
                </div>
                <div className="flex min-h-[90px] flex-col justify-between rounded-2xl border border-(--border) bg-(--surface-muted) px-4 py-3">
                  <p className="text-xs uppercase theme-muted">Duplicados internos</p>
                  <p className="text-2xl font-semibold theme-title">{duplicatesInCase}</p>
                </div>
                <div className="flex min-h-[90px] flex-col justify-between rounded-2xl border border-(--border) bg-(--surface-muted) px-4 py-3">
                  <p className="text-xs uppercase theme-muted">Duplicados otros casos</p>
                  <p className="text-2xl font-semibold theme-title">{duplicateMatches.length}</p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Link
                href="/"
                className="rounded-full border border-(--border) px-3 py-2 text-xs font-semibold theme-muted transition hover:border-(--accent)"
              >
                Volver a inicio
              </Link>
              <span
                className={`rounded-full px-3 py-2 text-xs font-semibold ${
                  normalizedStatus === "TERMINADO"
                    ? "bg-(--status-terminated-pill)] text-(--status-terminated-text)]"
                    : "bg-(--status-active-pill)] text-(--status-active-text)]"
                }`}
              >
                {normalizedStatus}
              </span>
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
