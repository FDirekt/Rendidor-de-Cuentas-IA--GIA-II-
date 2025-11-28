'use client';

import Link from "next/link";

type FinalActionsPanelProps = {
  caseStatus: string;
  docsCount: number;
  duplicatesCount: number;
  finalizing: boolean;
  finalMessage: string | null;
  onFinalize: () => Promise<void>;
};

export function FinalActionsPanel({
  caseStatus,
  docsCount,
  duplicatesCount,
  finalizing,
  finalMessage,
  onFinalize,
}: FinalActionsPanelProps) {
  return (
    <div className="theme-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold theme-title">Acciones finales</p>
          <p className="text-xs theme-muted">Genera el PDF y marca el caso como terminado</p>
        </div>
        <span
          className={`theme-chip rounded-full px-3 py-1 text-[11px] font-semibold ${
            caseStatus === "TERMINADO" ? "text-emerald-700" : ""
          }`}
        >
          {caseStatus}
        </span>
      </div>
      <div className="mt-3 space-y-2 text-sm theme-muted">
        <p>Documentos: {docsCount}</p>
        <p>Duplicados / Ya registrados: {duplicatesCount}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onFinalize}
          disabled={finalizing || docsCount === 0 || caseStatus !== "ACTIVO"}
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
  );
}
