'use client';

import type { Dispatch, SetStateAction } from "react";
import type { UploadFormState } from "@/app/upload/types";

type UploadFormProps = {
  form: UploadFormState;
  setForm: Dispatch<SetStateAction<UploadFormState>>;
  submitting: boolean;
  caseLocked?: boolean;
};

export function UploadForm({ form, setForm, submitting, caseLocked }: UploadFormProps) {
  return (
    <div className="theme-card rounded-2xl p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs theme-muted">Sube el PDF y edita campos si hace falta.</span>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-gradient-to-r from-sky-700 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:from-sky-800 hover:to-blue-700 disabled:opacity-60"
          >
            {submitting ? "Procesando..." : "Subir y procesar"}
          </button>
        </div>

        <div>
          <label className="text-sm font-semibold theme-title">Caso</label>
          <input
            value={form.caseId}
            onChange={(e) => setForm((f) => ({ ...f, caseId: e.target.value }))}
            className="theme-input mt-1 w-full rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none disabled:opacity-70"
            placeholder="Ej: C-1"
            required
            readOnly={caseLocked}
            disabled={caseLocked}
          />
        </div>
        <div>
          <label className="text-sm font-semibold theme-title">
            Tipo de documento
          </label>
          <select
            value={form.tipo}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                tipo: e.target.value as UploadFormState["tipo"],
              }))
            }
            className="theme-input mt-1 w-full rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          >
            <option value="Pagos">Pagos</option>
            <option value="Devengados">Devengados</option>
            <option value="DocumentacionAdicional">Documentación Adicional</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold theme-title">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            className="theme-input mt-1 w-full rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            placeholder="Ej: MEP_4291.pdf"
          />
        </div>
        <div>
          <label className="text-sm font-semibold theme-title">Archivo PDF</label>
          <div
            className="mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 px-4 py-6 text-sm theme-muted hover:border-sky-400"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) setForm((f) => ({ ...f, file }));
            }}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setForm((f) => ({ ...f, file }));
              }}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer font-semibold text-sky-700">
              Click o arrastra un PDF aquí
            </label>
            {form.file && (
              <p className="mt-2 text-xs text-slate-600">Seleccionado: {form.file.name}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
