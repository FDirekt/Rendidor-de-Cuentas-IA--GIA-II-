'use client';

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { DocumentList } from "@/components/DocumentList";
import { UploadForm } from "@/components/UploadForm";
import { TemplateDownloads } from "@/components/TemplateDownloads";
import { ManualFieldsSection } from "@/components/ManualFieldsSection";
import { tipoCampos } from "./fieldDefinitions";
import { fileToBase64 } from "./utils";
import type { DocumentRecord, TipoDoc, UploadFormState } from "./types";

type UploadClientProps = {
  initialCaseId?: string;
};

export function UploadClient({ initialCaseId }: UploadClientProps) {
  const [form, setForm] = useState<UploadFormState>({
    caseId: initialCaseId ?? "C-101",
    tipo: "Pagos",
    nombre: "",
    manualFields: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);

  const homeHref = form.caseId ? `/cases/${encodeURIComponent(form.caseId)}` : "/";

  const loadDocs = useCallback(
    async (caseId?: string) => {
      const targetCaseId = caseId ?? form.caseId;
      const endpoint = targetCaseId ? `/api/cases/${targetCaseId}/documents` : "/api/documents";
      const res = await fetch(endpoint);
      const json = await res.json();
      const incoming = json.documents ?? [];
      const filtered = targetCaseId ? incoming.filter((d: DocumentRecord) => d.caseId === targetCaseId) : incoming;
      setDocs(filtered);
    },
    [form.caseId]
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    if (initialCaseId) {
      setForm((prev) => ({ ...prev, caseId: initialCaseId }));
    }
  }, [initialCaseId]);

  useEffect(() => {
    const tipoParam = searchParams?.get("tipo");
    const caseParam = searchParams?.get("caseId");
    if (tipoParam === "Pagos" || tipoParam === "Devengados" || tipoParam === "DocumentacionAdicional") {
      setForm((prev) => ({ ...prev, tipo: tipoParam }));
    }
    if (caseParam && !initialCaseId) {
      setForm((prev) => ({ ...prev, caseId: caseParam }));
    }
  }, [searchParams, initialCaseId]);

  useEffect(() => {
    loadDocs(form.caseId).catch(() => undefined);
  }, [form.caseId, loadDocs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      let contentBase64: string | undefined;
      let manualPayload: unknown = undefined;

      if (form.file) {
        contentBase64 = await fileToBase64(form.file);
      } else {
        const manualSource = Object.keys(form.manualFields).length ? JSON.stringify(form.manualFields) : form.nombre || "manual-entry";
        contentBase64 = btoa(manualSource);
      }
      manualPayload = form.manualFields;

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: form.caseId,
          tipo: form.tipo,
          nombre: form.nombre || form.file?.name,
          contentBase64,
          manualFields: manualPayload,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al subir documento");
      }
      setMessage("Documento procesado (mock).");
      setForm((prev) => ({ ...prev, nombre: "", file: undefined, manualFields: {} }));
      await loadDocs(form.caseId);
      if (form.caseId) {
        window.location.href = homeHref;
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al subir documento.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocEdit = useCallback(
    ({ doc, parsedExtraction }: { doc: DocumentRecord; parsedExtraction: Record<string, string> }) => {
      setForm((f) => ({
        ...f,
        manualFields: parsedExtraction,
        tipo: doc.tipo as TipoDoc,
        nombre: doc.nombre,
      }));
    },
    []
  );

  return (
    <main className="min-h-screen px-4 py-4 text-[color:var(--foreground)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Header
          title="Subir Pagos, Devengados y Documentación Adicional"
          subtitle={
            form.caseId
              ? `Caso ${form.caseId} · Se guardará aquí y luego regresa al detalle del caso`
              : "Pipeline mock (OCR + LLM + deduplicado por hash + juez)"
          }
          homeHref={homeHref}
        />

        <section className="space-y-4">
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
            <UploadForm form={form} setForm={setForm} submitting={submitting} caseLocked={!!form.caseId} />
            <ManualFieldsSection
              form={form}
              setForm={setForm}
              submitting={submitting}
              message={message}
              fieldDefinitions={tipoCampos[form.tipo]}
            />
          </form>
          <DocumentList
            docs={docs}
            onEdit={handleDocEdit}
            title={form.caseId ? `Documentos del caso ${form.caseId}` : "Documentos cargados"}
          />
        </section>

        <TemplateDownloads />
      </div>
    </main>
  );
}
