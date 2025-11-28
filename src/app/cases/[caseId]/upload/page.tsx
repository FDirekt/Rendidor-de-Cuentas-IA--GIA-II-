import { redirect } from "next/navigation";
import { UploadClient } from "@/app/upload/UploadClient";

type PageProps = { params: Promise<{ caseId: string }> | { caseId: string } };

export default async function CaseUploadPage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  const caseId = resolved?.caseId;
  if (!caseId) redirect("/");
  return <UploadClient initialCaseId={caseId} />;
}
