import type { Metadata } from "next";
import Link from "next/link";
import { loadSubjectApparatus } from "@/lib/content/apparatus";
import { ApparatusInventory } from "@/components/lab/ApparatusInventory";

export const metadata: Metadata = {
  title: "Physics apparatus laboratory · Expera Physics",
  description: "Explore the Physics instruments and apparatus used in school practicals, including Vernier calipers, micrometer, metre rule, stopwatch, density set and parallax scale.",
};

export default function PhysicsApparatusPage() {
  const apparatus = loadSubjectApparatus("physics");

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-3 pb-20 pt-5 sm:px-6">
      <header className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <Link href="/physics?tab=lab" className="text-xs font-semibold text-sky-700 underline-offset-4 hover:underline">← Physics Lab</Link>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">Physics · Apparatus guide</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Physics apparatus laboratory</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          Inspect every instrument used in the measurement practical. Click an item in the 3D storeroom to see a short reminder inside the room, then read the full guide below: what it is for, how to use it, the key point and safety notes. All {apparatus.length} guides are also available as a plain list when 3D is unavailable.
        </p>
      </header>

      <ApparatusInventory items={apparatus} title="Physics apparatus store" subject="physics" />
    </div>
  );
}
