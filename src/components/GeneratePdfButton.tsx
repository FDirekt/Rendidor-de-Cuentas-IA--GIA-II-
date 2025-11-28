'use client';

import { useState } from "react";

export function GeneratePdfButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pdf", { method: "POST" });
      const json = await res.json();
      setMessage(json.message ?? "Respuesta recibida");
    } catch {
      setMessage("Error al generar PDF (stub).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="theme-cta rounded-full px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Generando..." : "Generar PDF (mock)"}
      </button>
      {message && <span className="text-xs theme-muted">{message}</span>}
    </div>
  );
}
