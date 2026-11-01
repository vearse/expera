import { notFound } from "next/navigation";
import { listExperimentIds, loadExperiment } from "@/lib/content/load";
import { loadLabData } from "@/lib/content/labData";
import { ExperimentRunner } from "@/components/runner/ExperimentRunner";

export function generateStaticParams() {
  return listExperimentIds().map((experiment) => ({ experiment }));
}

export default async function PracticePage({ params }: { params: Promise<{ experiment: string }> }) {
  const { experiment } = await params;
  if (!listExperimentIds().includes(experiment)) notFound();
  return <ExperimentRunner experiment={loadExperiment(experiment)} data={loadLabData()} />;
}
