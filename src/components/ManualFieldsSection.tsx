'use client';

import type { ManualFieldDef, UploadFormState } from "@/app/upload/types";
import type { Dispatch, SetStateAction } from "react";

type ManualFieldsSectionProps = {
  form: UploadFormState;
  setForm: Dispatch<SetStateAction<UploadFormState>>;
  submitting: boolean;
  message: string | null;
  fieldDefinitions: ManualFieldDef[];
};

export function ManualFieldsSection({
  form,
  setForm,
  submitting,
  message,
  fieldDefinitions,
}: ManualFieldsSectionProps) {
  return (
    <div className="theme-card-muted grid gap-3 rounded-2xl p-4">
      <p className="text-sm font-semibold theme-title">
        Campos manuales ({form.tipo}) — se rellenan con OCR/LLM, editables
      </p>
      {fieldDefinitions.map((campo) => (
        <div key={campo.key}>
          <label className="text-xs font-semibold theme-title">
            {campo.label}
          </label>
          <input
            value={form.manualFields[campo.key] ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                manualFields: { ...f.manualFields, [campo.key]: e.target.value },
              }))
            }
            placeholder={campo.placeholder}
            className="theme-input mt-1 w-full rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>
      ))}
      <p className="text-xs theme-muted">
        Si dejas un campo vacío y no subes PDF, se usará un placeholder mínimo.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs theme-muted">Guarda cambios manuales antes de procesar.</span>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-gradient-to-r from-sky-700 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:from-sky-800 hover:to-blue-700 disabled:opacity-60"
        >
          {submitting ? "Procesando..." : "Subir y procesar"}
        </button>
        {message && <span className="text-sm theme-muted">{message}</span>}
      </div>
    </div>
  );
}
