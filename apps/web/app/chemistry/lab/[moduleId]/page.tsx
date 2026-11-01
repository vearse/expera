import { notFound, redirect } from "next/navigation";
import { ModuleTopicPage } from "@/components/modules/ModuleTopicPage";
import { getModuleDetail, listModuleIds } from "@/lib/modules/getModuleDetail";
import { listExperimentIds } from "@/lib/content/load";

type PageProps = { params: Promise<{ moduleId: string }> };

export async function generateStaticParams() {
  const ids = await listModuleIds("chemistry", "lab");
  return ids.map((moduleId) => ({ moduleId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { moduleId } = await params;
  const detail = await getModuleDetail({ subject: "chemistry", kind: "lab", id: moduleId });
  if (!detail) return { title: "Lab module | Expera" };
  return { title: `${detail.title} | Expera Chemistry` };
}

export default async function ChemistryLabTopicPage({ params }: PageProps) {
  const { moduleId } = await params;

  if (listExperimentIds().includes(moduleId)) {
    redirect(`/chemistry/practice/${moduleId}`);
  }

  const detail = await getModuleDetail({ subject: "chemistry", kind: "lab", id: moduleId });
  if (!detail) notFound();
  return <ModuleTopicPage detail={detail} />;
}
