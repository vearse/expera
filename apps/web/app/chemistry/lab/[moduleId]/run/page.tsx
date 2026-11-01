import { notFound, redirect } from "next/navigation";
import { ChemistryLabRun } from "@/components/chemistry/ChemistryLabRun";
import { getModuleDetail, listModuleIds } from "@/lib/modules/getModuleDetail";
import { getLocalChemistryModule } from "@/lib/modules/catalogue/chemistry";

type PageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export async function generateStaticParams() {
  const ids = await listModuleIds("chemistry", "lab");
  return ids.filter((id) => getLocalChemistryModule("lab", id)?.runAvailable).map((moduleId) => ({ moduleId }));
}

export default async function ChemistryLabRunPage({ params, searchParams }: PageProps) {
  const { moduleId } = await params;
  const { mode: rawMode } = await searchParams;
  const mode = rawMode === "explore" ? "explore" : "guided";

  const detail = await getModuleDetail({ subject: "chemistry", kind: "lab", id: moduleId });
  if (!detail) notFound();
  if (!detail.runAvailable) redirect(`/chemistry/lab/${moduleId}`);

  const run = ChemistryLabRun({ moduleId, mode });
  if (!run) notFound();
  return run;
}
