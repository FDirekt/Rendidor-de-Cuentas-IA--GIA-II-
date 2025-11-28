'use client';

import { useEffect, useState } from "react";

type Doc = {
  id: string;
  caseId: string;
  nombre: string;
  tipo: string;
  hash: string;
  duplicateOfId: string | null;
  duplicateOfCaseId: string | null;
  uploadedAt: string;
};

export default function FinalizePage() {
  const [caseId, setCaseId] = useState("C-101");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadDocs = async (id: string) => {
    const res = await fetch(`/api/cases/${id}/documents`);
    const json = await res.json();
    setDocs(json.documents ?? []);
  };

  useEffect(() => {
    loadDocs(caseId).catch(() => undefined);
  }, [caseId]);

  const handleFinalize = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al generar PDF final");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `final_${caseId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("PDF final generado y descargado.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al generar PDF.");
    } finally {
      setLoading(false);
    }
  };

  const duplicates = docs.filter((d) => d.duplicateOfId);

  return (
    <main className="min-h-screen px-6 py-10 text-[color:var(--foreground)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="theme-card rounded-2xl p-6">
          <p className="text-sm font-semibold text-sky-700">Finalizar caso</p>
          <h1 className="text-2xl font-bold tracking-tight theme-title">Generar PDF final para Tribunal</h1>
          <p className="text-sm theme-muted">
            Se verifica si algún documento ya existe en otro trámite antes de generar el PDF.
          </p>
        </header>

        <section className="theme-card grid gap-4 rounded-2xl p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col">
              <label className="text-sm font-semibold theme-title">Caso</label>
              <input
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="theme-input mt-1 w-48 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => loadDocs(caseId)}
              className="theme-chip rounded-full px-3 py-2 text-xs font-semibold hover:brightness-105"
            >
              Recargar
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between">
            <p className="text-sm theme-muted">
              Documentos en el caso: {docs.length} · Duplicados detectados: {duplicates.length}
            </p>
            <button
              onClick={handleFinalize}
              disabled={loading}
              className="theme-cta rounded-full px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Generando..." : "Generar PDF final"}
            </button>
          </div>

          {message && <p className="text-sm text-[color:var(--accent)]">{message}</p>}

          <div className="theme-card-muted rounded-xl border p-4">
            <p className="text-sm font-semibold theme-title">Duplicados (hash en otros casos)</p>
            {duplicates.length === 0 && (
              <p className="text-sm theme-muted">Sin duplicados detectados.</p>
            )}
            <div className="mt-3 grid gap-2">
              {duplicates.map((d) => (
                <div key={d.id} className="theme-card-muted rounded-lg border p-3 text-sm" style={{ borderColor: "color-mix(in srgb, #f59e0b 32%, var(--border))" }}>
                  <p className="font-semibold theme-title">{d.nombre}</p>
                  <p className="text-amber-700 text-xs">
                    Hash coincide con doc {d.duplicateOfId} en caso {d.duplicateOfCaseId}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-card-muted rounded-xl border p-4">
            <p className="text-sm font-semibold theme-title">Documentos del caso</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {docs.map((d) => (
                <div key={d.id} className="theme-card rounded-lg border p-3 text-sm">
                  <p className="font-semibold theme-title">{d.nombre}</p>
                  <p className="text-xs theme-muted">{d.tipo}</p>
                  <p className="text-[11px] theme-muted break-all">Hash: {d.hash}</p>
                  {d.duplicateOfId && (
                    <p className="text-amber-700 text-xs">
                      Duplicado de {d.duplicateOfId} en caso {d.duplicateOfCaseId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
