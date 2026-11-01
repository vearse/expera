import { Suspense } from "react";
import { PhysicsHubView } from "@/components/physics/PhysicsHubView";
import { loadPhysics } from "@/lib/content/physics";
import { loadPendulum } from "@/lib/content/pendulum";

export default function PhysicsHubPage() {
  const physics = loadPhysics();
  const pendulum = loadPendulum();
  return (
    <Suspense fallback={<p className="p-6 text-sm text-secondary">Loading…</p>}>
      <PhysicsHubView measurementReview={physics.review} pendulumReview={pendulum.review} />
    </Suspense>
  );
}
