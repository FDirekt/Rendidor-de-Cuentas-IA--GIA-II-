'use client';

import { useMemo, useState } from "react";
import Link from "next/link";

type DocumentPreview = {
  id: string;
  nombre: string;
  tipo: string;
  uploadedAt: string;
  duplicateOfCaseId?: string | null;
};

export type CasePreview = {
  id: string;
  name: string;
  status: string;
  owner?: string | null;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { documents: number };
  documents?: DocumentPreview[];
};

type CaseStatusKey = "ACTIVO" | "TERMINADO";
type StatusKey = CaseStatusKey | "TODOS";

type StatusStyle = {
  label: string;
  dot: string;
  chipTone: string;
  chipBg: string;
  accentBorder: string;
};

const statusStyles: Record<StatusKey, StatusStyle> = {
  ACTIVO: {
    label: "Activos",
    dot: "bg-[color:var(--status-active-dot)]",
    chipTone: "text-[color:var(--status-active-text)]",
    chipBg: "bg-[color:var(--status-active-pill)]",
    accentBorder: "color-mix(in srgb, var(--status-active-dot) 48%, var(--border))",
  },
  TERMINADO: {
    label: "Terminados",
    dot: "bg-[color:var(--status-terminated-dot)]",
    chipTone: "text-[color:var(--status-terminated-text)]",
    chipBg: "bg-[color:var(--status-terminated-pill)]",
    accentBorder: "color-mix(in srgb, var(--status-terminated-dot) 48%, var(--border))",
  },
  TODOS: {
    label: "Todos",
    dot: "bg-amber-500",
    chipTone: "text-amber-700",
    chipBg: "bg-amber-100",
    accentBorder: "color-mix(in srgb, var(--border) 70%, var(--surface))",
  },
};

type CaseDashboardProps = {
  initialCases: CasePreview[];
};

function normalizeStatusValue(status: string): CaseStatusKey {
  if (status === "TERMINADO") return "TERMINADO";
  return "ACTIVO";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export function CaseDashboard({ initialCases }: CaseDashboardProps) {
  const [cases, setCases] = useState<CasePreview[]>(
    initialCases.map((c) => ({ ...c, status: normalizeStatusValue(c.status) }))
  );
  const [tab, setTab] = useState<StatusKey>("ACTIVO");
  const [newCase, setNewCase] = useState<{ name: string; summary: string; status: CaseStatusKey }>(
    { name: "", summary: "", status: "ACTIVO" }
  );
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (tab === "TODOS") {
      const activeCases = cases.filter((c) => normalizeStatusValue(c.status) === "ACTIVO");
      const otherCases = cases.filter((c) => normalizeStatusValue(c.status) !== "ACTIVO");
      return [...activeCases, ...otherCases];
    }
    return cases.filter((c) => normalizeStatusValue(c.status) === tab);
  }, [cases, tab]);

  const counts = useMemo(
        () =>
          cases.reduce(
            (acc, c) => {
              const status = normalizeStatusValue(c.status);
              acc[status] = (acc[status] ?? 0) + 1;
              acc.TODOS += 1;
              return acc;
            },
        { ACTIVO: 0, TERMINADO: 0, TODOS: 0 } as Record<StatusKey, number>
      ),
    [cases]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.name.trim()) {
      setError("Asigna un nombre al caso");
      return;
    }
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCase.name, summary: newCase.summary, status: newCase.status, owner: "Sofía Videla" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo crear el caso");
      }
      const json = await res.json();
      setCases((prev) => [{ ...json.case, status: normalizeStatusValue(json.case.status) }, ...prev]);
      setNewCase({ name: "", summary: "", status: "ACTIVO" });
      setTab(json.case.status as StatusKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear caso");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="theme-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(statusStyles) as StatusKey[]).map((key) => (
            key === "TODOS" ? null : (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
                  tab === key
                    ? "bg-(--foreground) text-(--surface) shadow-sm"
                    : "theme-chip hover:brightness-105"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${statusStyles[key].dot}`}></span>
                {statusStyles[key].label}
                <span className="theme-chip rounded-full px-2 text-[11px]">
                  {counts[key]}
                </span>
              </button>
            )
          ))}
          <button
            onClick={() => setTab(tab === "TODOS" ? "ACTIVO" : "TODOS")}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
              tab === "TODOS"
                ? "bg-(--foreground) text-(--surface) shadow-sm"
                : "theme-chip hover:brightness-105"
            }`}
          >
            Todas
            <span className="theme-chip rounded-full px-2 text-[11px]">{counts.TODOS}</span>
          </button>
        </div>
        <div className="text-xs theme-muted">Actualizado {formatDate(new Date().toISOString())}</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.length === 0 && (
            <div className="theme-card col-span-full rounded-2xl border border-dashed p-6 text-sm theme-muted">
              No hay casos en este estado todavía.
            </div>
          )}
          {filtered.map((c) => {
            const docsCount = c._count?.documents ?? c.documents?.length ?? 0;
            const lastDocs = (c.documents ?? []).slice(0, 2);
            const normalizedStatus = normalizeStatusValue(c.status);
            const badgeStyle = statusStyles[normalizedStatus];
            return (
              <div
                key={c.id}
                className="theme-card flex flex-col gap-3 rounded-2xl p-5"
                style={{ borderColor: badgeStyle.accentBorder }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-[0.08em] theme-muted">Caso {c.id}</p>
                    <h3 className="text-lg font-semibold theme-title">{c.name}</h3>
                    <p className="text-sm theme-muted line-clamp-2">{c.summary ?? "Sin descripción"}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badgeStyle.chipTone} ${badgeStyle.chipBg}`}
                  >
                    {badgeStyle.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs theme-muted">
                  <span className="theme-doc-chip rounded-full px-2 py-1 text-[11px] font-semibold text-(--muted-text)">
                    {docsCount} docs
                  </span>
                  <span className="theme-chip rounded-full px-2 py-1">Última act. {formatDate(c.updatedAt)}</span>
                  {c.owner && <span className="theme-chip rounded-full px-2 py-1">Responsable {c.owner}</span>}
                </div>

                <div className="grid gap-2 text-sm">
                  {lastDocs.map((d) => (
                    <div key={d.id} className="theme-card-muted flex items-center justify-between rounded-xl px-3 py-2 text-[13px]">
                      <div className="flex flex-col">
                        <span className="font-semibold theme-title">{d.nombre}</span>
                        <span className="theme-muted">{d.tipo}</span>
                        {d.duplicateOfCaseId && (
                          <span className="text-[11px] text-amber-700">Hash visto en caso {d.duplicateOfCaseId}</span>
                        )}
                      </div>
                      <span className="text-[11px] theme-muted">{formatDate(d.uploadedAt)}</span>
                    </div>
                  ))}
                  {lastDocs.length === 0 && <p className="text-xs theme-muted">Sin documentos aún.</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/cases/${c.id}`}
                    className="theme-cta rounded-full px-4 py-2 text-xs font-semibold shadow hover:brightness-105"
                  >
                    Abrir caso
                  </Link>
                  <Link
                    href={`/upload?caseId=${c.id}&tipo=Pagos`}
                    className="theme-chip rounded-full px-4 py-2 text-xs font-semibold hover:brightness-105"
                  >
                    Subir doc rápido
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="newcase-card flex flex-col gap-3 rounded-2xl px-5 py-6">
          <p className="text-xs uppercase tracking-[0.08em] theme-muted">Nuevo caso</p>
          <form className="flex flex-col gap-3" onSubmit={handleCreate}>
            <div>
              <label className="text-xs font-semibold theme-title">Nombre</label>
              <input
                value={newCase.name}
                onChange={(e) => setNewCase((c) => ({ ...c, name: e.target.value }))}
                className="theme-input mt-1 w-full rounded-lg px-3 py-2 text-sm placeholder:text-(--muted-text) focus:border-sky-400 focus:outline-none"
                placeholder="Ej: Rendición cultura"
              />
            </div>
            <div>
              <label className="text-xs font-semibold theme-title">Resumen</label>
              <textarea
                value={newCase.summary}
                onChange={(e) => setNewCase((c) => ({ ...c, summary: e.target.value }))}
                className="theme-input mt-1 w-full rounded-lg px-3 py-2 text-sm placeholder:text-(--muted-text) focus:border-sky-400 focus:outline-none"
                rows={3}
                placeholder="Notas rápidas del caso"
              />
            </div>
            <div className="theme-card-muted rounded-xl p-3 text-xs theme-muted">
              Los casos se crean como <strong>Activos</strong>. Podrás marcarlos como finalizados desde el detalle del caso.
            </div>
            <button
              type="submit"
              disabled={creating}
              className="theme-chip mt-1 rounded-full px-4 py-2 text-sm font-semibold hover:brightness-105 disabled:opacity-60"
            >
              {creating ? "Creando..." : "Crear caso"}
            </button>
            {error && <p className="text-xs text-amber-600">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
