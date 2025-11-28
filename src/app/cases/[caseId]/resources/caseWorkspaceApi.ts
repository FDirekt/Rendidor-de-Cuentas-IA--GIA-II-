import type { DocumentRecord } from "@/app/upload/types";
import { DuplicateMatch } from "./caseWorkspaceTypes";

export type CaseWorkspaceResponse = {
  documents?: DocumentRecord[];
  duplicateMatches?: DuplicateMatch[];
  case?: { status?: string };
};

export async function fetchCaseWorkspace(caseId: string): Promise<CaseWorkspaceResponse> {
  const res = await fetch(`/api/cases/${caseId}`);
  if (!res.ok) throw new Error("No se pudo cargar el caso.");
  return res.json();
}

export async function finalizeCaseWorkspace(caseId: string): Promise<Blob> {
  const res = await fetch("/api/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Error al generar PDF final");
  }
  return res.blob();
}

export async function updateCaseStatus(caseId: string, status: string): Promise<void> {
  const res = await fetch(`/api/cases/${caseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el estado del caso.");
}

export async function deleteDocumentById(docId: string): Promise<void> {
  const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "No se pudo eliminar el documento.");
  }
}
