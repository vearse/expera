import type { Metadata } from "next";
import { loadPhysics } from "@/lib/content/physics";
import { loadSubjectApparatus } from "@/lib/content/apparatus";
import { PhysicsLaboratory } from "@/components/physics/lab/PhysicsLaboratory";

export const metadata: Metadata = {
  title: "Measurement and errors laboratory · Expera Physics",
  description: "Interactive Physics measurement practical with Vernier calipers, micrometer, metre rule, stopwatch, parallax and density stations.",
};

export default function MeasurementLabPage() {
  return <PhysicsLaboratory data={loadPhysics()} apparatus={loadSubjectApparatus("physics")} />;
}
