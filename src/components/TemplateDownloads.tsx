'use client';

import { useState } from "react";
import {
  sampleDevengados,
  sampleDocAdicional,
  samplePagos,
} from "@/lib/templateSamples";

type TemplateButtonProps = {
  tipo: "pagos" | "devengados" | "documentacion";
  label: string;
  payload: unknown;
};

function TemplateButton({ tipo, label, payload }: TemplateButtonProps) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/templates/${tipo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-800 disabled:opacity-60"
    >
      {loading ? "Generando..." : label}
    </button>
  );
}

export function TemplateDownloads() {
  return (
    <section className="theme-card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold theme-title">Generar plantilla PDF</h2>
          <p className="text-sm theme-muted">
            Genera PDFs base para pruebas de OCR/LLM. Se descargan con datos de ejemplo.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <TemplateButton tipo="pagos" label="Descargar Pagos" payload={samplePagos} />
        <TemplateButton tipo="devengados" label="Descargar Devengados" payload={sampleDevengados} />
        <TemplateButton tipo="documentacion" label="Descargar Doc. Adicional" payload={sampleDocAdicional} />
      </div>
    </section>
  );
}
