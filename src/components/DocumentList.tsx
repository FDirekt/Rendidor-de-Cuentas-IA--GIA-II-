'use client';

import type { DocumentRecord } from "@/app/upload/types";

type DocumentListProps = {
  docs: DocumentRecord[];
  onEdit: (payload: { doc: DocumentRecord; parsedExtraction: Record<string, string> }) => void;
  className?: string;
  title?: string;
  canDelete?: boolean;
  onDelete?: (doc: DocumentRecord) => void;
};

export function DocumentList({
  docs,
  onEdit,
  className = "",
  title = "Documentos cargados",
  canDelete = false,
  onDelete,
}: DocumentListProps) {
  const containerClass = [
    "theme-card rounded-2xl p-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const extractionPreview = (extraction: string) => {
    try {
      return JSON.stringify(JSON.parse(extraction));
    } catch {
      return extraction;
    }
  };

  const handleEditClick = (doc: DocumentRecord) => {
    let parsed: Record<string, string> = {};
    try {
      parsed = JSON.parse(doc.extraction);
    } catch {
      parsed = {};
    }
    onEdit({ doc, parsedExtraction: parsed });
  };

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold theme-title">{title}</h2>
        <span className="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
          {docs.length} docs
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {docs.length === 0 && (
          <p className="text-sm theme-muted">Aún no hay documentos.</p>
        )}
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="theme-card-muted rounded-xl p-4 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold theme-title">{doc.nombre}</p>
                <p className="theme-muted">{doc.tipo}</p>
                <p className="text-xs theme-muted">Caso: {doc.caseId}</p>
              </div>
              <div className="text-right text-xs theme-muted">
                <p>Subido: {new Date(doc.uploadedAt).toLocaleString()}</p>
                <p className="break-all font-mono">Hash: {doc.hash}</p>
              </div>
            </div>
            <div className="mt-3 text-xs theme-muted">
              <p>OCR: {doc.ocrText}</p>
              <p>Extracción LLM: {extractionPreview(doc.extraction)}</p>
              {doc.duplicateOfId ? (
                <p className="text-amber-600">
                  Duplicado de doc {doc.duplicateOfId} en caso {doc.duplicateOfCaseId} (Hash ya existente)
                </p>
              ) : doc.judgeStatus ? (
                <p className="text-emerald-600">
                  Juez: {doc.judgeStatus} · {doc.judgeReason}
                </p>
              ) : (
                <p className="text-sky-600">Pendiente de validación</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-200"
                  onClick={() => handleEditClick(doc)}
                >
                  Editar y re-chequear
                </button>
                {canDelete && onDelete && (
                  <button
                    className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 ring-1 ring-rose-200 transition hover:bg-rose-200"
                    onClick={() => onDelete(doc)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
