'use client';

import { useCallback, useState } from "react";
import { TemplateDownloads } from "@/components/TemplateDownloads";
import type { DocumentRecord } from "@/app/upload/types";
import { DuplicateMatch } from "@/app/cases/[caseId]/resources/caseWorkspaceTypes";
import {
  deleteDocumentById,
  fetchCaseWorkspace,
  finalizeCaseWorkspace,
  updateCaseStatus,
} from "@/app/cases/[caseId]/resources/caseWorkspaceApi";
import { DocumentList } from "@/components/DocumentList";
import { DuplicateMatchesPanel } from "@/app/cases/[caseId]/components/CaseWorkspaceDuplicatesPanel";
import { FinalActionsPanel } from "@/app/cases/[caseId]/components/CaseWorkspaceFinalActionsPanel";

type CaseWorkspaceProps = {
  caseId: string;
  caseName: string;
  initialStatus: string;
  initialDocs: DocumentRecord[];
  initialDuplicateMatches: DuplicateMatch[];
  summary?: string | null;
};

export function CaseWorkspace({
  caseId,
  caseName,
  initialStatus,
  initialDocs,
  initialDuplicateMatches,
}: CaseWorkspaceProps) {
  const [docs, setDocs] = useState<DocumentRecord[]>(initialDocs);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>(initialDuplicateMatches);
  const [caseStatus, setCaseStatus] = useState(initialStatus);
  const [finalizing, setFinalizing] = useState(false);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);

  const loadCase = useCallback(async () => {
    try {
      const json = await fetchCaseWorkspace(caseId);
      setDocs(json.documents ?? []);
      setDuplicates(json.duplicateMatches ?? []);
      if (json.case?.status) setCaseStatus(json.case.status);
    } catch {
      // Could expose a retry UI later if needed
    }
  }, [caseId]);

  const handleFinalize = async () => {
    setFinalizing(true);
    setFinalMessage(null);
    try {
      const blob = await finalizeCaseWorkspace(caseId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `final_${caseId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      await updateCaseStatus(caseId, "TERMINADO");
      setCaseStatus("TERMINADO");
      await loadCase();
      setFinalMessage("PDF final generado. Caso marcado como terminado.");
    } catch (err) {
      setFinalMessage(err instanceof Error ? err.message : "Error al generar PDF.");
    } finally {
      setFinalizing(false);
    }
  };

  const handleDeleteDoc = useCallback(
    async (doc: DocumentRecord) => {
      if (caseStatus !== "ACTIVO") return;
      const confirmed = window.confirm(`Eliminar "${doc.nombre}"? Esta acción no se puede deshacer.`);
      if (!confirmed) return;
      try {
        await deleteDocumentById(doc.id);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "No se pudo eliminar el documento.");
        return;
      }
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    },
    [caseStatus]
  );

  const handleDocEdit = useCallback(() => undefined, []);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <DocumentList
          docs={docs}
          onEdit={handleDocEdit}
          title={`Documentos del caso ${caseName}`}
          caseId={caseId}
          canDelete={caseStatus === "ACTIVO"}
          onDelete={handleDeleteDoc}
        />
        
        <div className="grid gap-4">
          <DuplicateMatchesPanel duplicates={duplicates} />
          <FinalActionsPanel
            caseStatus={caseStatus}
            docsCount={docs.length}
            duplicatesCount={duplicates.length}
            finalizing={finalizing}
            finalMessage={finalMessage}
            onFinalize={handleFinalize}
          />
        </div>
      </section>

      <TemplateDownloads />
    </div>
  );
}
