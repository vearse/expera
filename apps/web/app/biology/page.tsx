import { Suspense } from "react";
import { BiologyHubView } from "@/components/biology/BiologyHubView";
import { loadBiology } from "@/lib/content/biology";

export default function BiologyHubPage() {
  const { specimens } = loadBiology();
  return (
    <Suspense fallback={<p className="p-6 text-sm text-secondary">Loading…</p>}>
      <BiologyHubView specimensReview={specimens.review} />
    </Suspense>
  );
}
