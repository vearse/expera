import { notFound, redirect } from "next/navigation";
import { ChemistryLearnRun } from "@/components/chemistry/ChemistryLearnRun";
import { getModuleDetail, listModuleIds } from "@/lib/modules/getModuleDetail";
import { getLocalChemistryModule } from "@/lib/modules/catalogue/chemistry";

type PageProps = { params: Promise<{ moduleId: string }> };

export async function generateStaticParams() {
  const ids = await listModuleIds("chemistry", "learn");
  return ids.filter((id) => getLocalChemistryModule("learn", id)?.runAvailable).map((moduleId) => ({ moduleId }));
}

export default async function ChemistryLearnRunPage({ params }: PageProps) {
  const { moduleId } = await params;
  const detail = await getModuleDetail({ subject: "chemistry", kind: "learn", id: moduleId });
  if (!detail) notFound();
  if (!detail.runAvailable) redirect(`/chemistry/learn/${moduleId}`);

  const run = ChemistryLearnRun({ moduleId });
  if (!run) notFound();
  return run;
}
