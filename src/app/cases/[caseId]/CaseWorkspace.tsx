'use client';

import { useCallback, useState } from "react";
import Link from "next/link";
import { DocumentList } from "@/components/DocumentList";
import { TemplateDownloads } from "@/components/TemplateDownloads";
import type { DocumentRecord } from "@/app/upload/types";

type DuplicateMatch = {
  id: string;
  hash: string;
  nombre: string;
  caseId: string;
  tipo: string;
  uploadedAt: string;
};

type CaseWorkspaceProps = {
  caseId: string;
  caseName: string;
  initialStatus: string;
  initialDocs: DocumentRecord[];
  initialDuplicateMatches: DuplicateMatch[];
  summary?: string | null;
};

export function CaseWorkspace({
  caseId,
  caseName,
  initialStatus,
  initialDocs,
  initialDuplicateMatches,
  summary,
}: CaseWorkspaceProps) {
  const [docs, setDocs] = useState<DocumentRecord[]>(initialDocs);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>(initialDuplicateMatches);
  const [caseStatus, setCaseStatus] = useState(initialStatus);
  const [finalizing, setFinalizing] = useState(false);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadCase = useCallback(async () => {
    const res = await fetch(`/api/cases/${caseId}`);
    if (!res.ok) return;
    const json = await res.json();
    setDocs(json.documents ?? []);
    setDuplicates(json.duplicateMatches ?? []);
    if (json.case?.status) setCaseStatus(json.case.status);
  }, [caseId]);

  const handleFinalize = async () => {
    setFinalizing(true);
    setFinalMessage(null);
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

      await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TERMINADO" }),
      }).catch(() => undefined);
      setCaseStatus("TERMINADO");
      await loadCase();
      setFinalMessage("PDF final generado. Caso marcado como terminado.");
    } catch (err) {
      setFinalMessage(err instanceof Error ? err.message : "Error al generar PDF.");
    } finally {
      setFinalizing(false);
    }
  };

  const handleDeleteDoc = useCallback(
    async (doc: DocumentRecord) => {
      if (caseStatus !== "ACTIVO") return;
      const confirmed = window.confirm(`Eliminar "${doc.nombre}"? Esta acción no se puede deshacer.`);
      if (!confirmed) return;
      setDeleteMessage(null);
      setDeleteError(null);
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setDeleteError(err?.error ?? "No se pudo eliminar el documento.");
        return;
      }
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      setDeleteMessage("Documento eliminado.");
    },
    [caseStatus]
  );

  const handleDocEdit = useCallback(() => undefined, []);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <DocumentList
          docs={docs}
          onEdit={handleDocEdit}
          title={`Documentos del caso ${caseName}`}
          canDelete={caseStatus === "ACTIVO"}
          onDelete={handleDeleteDoc}
        />
        {deleteMessage && <p className="text-sm text-emerald-700">{deleteMessage}</p>}
        {deleteError && <p className="text-sm text-rose-700">{deleteError}</p>}
        <div className="theme-card flex flex-col gap-4 rounded-2xl p-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold theme-title">Cargar nuevos documentos</p>
            <p className="text-sm theme-muted">
              La carga se realiza en la pantalla dedicada y vuelve a este caso con el juez y duplicados.
            </p>
          </div>
          <Link
            href={`/cases/${caseId}/upload?tipo=Pagos`}
            className="theme-cta inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow hover:brightness-105"
          >
            Ir a subir documentos
          </Link>
          <div className="theme-card-muted rounded-xl p-3 text-xs theme-muted">
            Tip: puedes abrir múltiples pestañas para Pagos/Devengados/Adicional, siempre con el caseId fijado.
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="theme-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold theme-title">Duplicados y juez</p>
              <p className="text-xs theme-muted">Chequeo cruzado contra toda la DB y otros casos</p>
            </div>
            <span className="theme-chip rounded-full px-3 py-1 text-[11px] font-semibold">
              {duplicates.length} hallazgos
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {duplicates.map((d) => (
              <div key={d.id} className="theme-card-muted rounded-xl border px-3 py-2" style={{ borderColor: "color-mix(in srgb, #f59e0b 32%, var(--border))" }}>
                <p className="font-semibold theme-title">{d.nombre}</p>
                <p className="text-xs text-amber-700">Duplicado en caso {d.caseId} · {d.tipo}</p>
              </div>
            ))}
            {duplicates.length === 0 && (
              <p className="text-xs theme-muted">Sin duplicados detectados por ahora.</p>
            )}
          </div>
        </div>

        <div className="theme-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold theme-title">Acciones finales</p>
              <p className="text-xs theme-muted">Genera el PDF y marca el caso como terminado</p>
            </div>
            <span className={`theme-chip rounded-full px-3 py-1 text-[11px] font-semibold ${
              caseStatus === "TERMINADO" ? "text-emerald-700" : ""
            }`}>
              {caseStatus}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm theme-muted">
            <p>Documentos: {docs.length}</p>
            <p>Duplicados / Ya registrados: {duplicates.length}</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleFinalize}
              disabled={finalizing || docs.length === 0 || caseStatus !== "ACTIVO"}
              className="theme-chip rounded-full px-4 py-2 text-sm font-semibold hover:brightness-105 disabled:opacity-60"
            >
              {finalizing ? "Generando..." : "Generar PDF final"}
            </button>
            <Link
              href="/"
              className="theme-cta rounded-full px-4 py-2 text-sm font-semibold shadow hover:brightness-105"
            >
              Volver a casos
            </Link>
          </div>
          {finalMessage && <p className="mt-2 text-sm text-emerald-600">{finalMessage}</p>}
        </div>
      </section>

      <TemplateDownloads />
    </div>
  );
}
