'use client';

import { DuplicateMatch } from "@/app/cases/[caseId]/resources/caseWorkspaceTypes";

type DuplicatesPanelProps = {
  duplicates: DuplicateMatch[];
};

export function DuplicateMatchesPanel({ duplicates }: DuplicatesPanelProps) {
  return (
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
          <div
            key={d.id}
            className="theme-card-muted rounded-xl border px-3 py-2"
            style={{ borderColor: "color-mix(in srgb, #f59e0b 32%, var(--border))" }}
          >
            <p className="font-semibold theme-title">{d.nombre}</p>
            <p className="text-xs text-amber-700">
              Duplicado en caso {d.caseId} · {d.tipo}
            </p>
          </div>
        ))}
        {duplicates.length === 0 && (
          <p className="text-xs theme-muted">Sin duplicados detectados por ahora.</p>
        )}
      </div>
    </div>
  );
}
