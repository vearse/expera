import type { Metadata } from "next";
import { loadPendulum } from "@/lib/content/pendulum";
import { PendulumLaboratory } from "@/components/physics/lab/PendulumLaboratory";
import { LabExperience } from "@/components/lab/LabExperience";

export const metadata: Metadata = {
  title: "Simple pendulum practical · Expera Physics",
  description: "Interactive simple-pendulum practical: measure effective length, time oscillations, plot T squared against L and determine g.",
};

export default function PendulumLabPage() {
  return (
    <LabExperience title="Simple pendulum" subject="Physics">
      <PendulumLaboratory data={loadPendulum()} />
    </LabExperience>
  );
}
