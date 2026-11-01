import type { Metadata } from "next";
import Link from "next/link";
import { loadBiology } from "@/lib/content/biology";
import { BiologyLaboratory } from "@/components/biology/lab/BiologyLaboratory";

export const metadata: Metadata = {
  title: "Cells and microscopy · Biology Lab | Expera",
  description: "Prepare slides and operate a compound light microscope in the Expera Biology virtual laboratory.",
};

export default function MicroscopyLabPage() {
  const data = loadBiology();

  return (
    <div className="grid gap-4">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600" aria-label="Breadcrumb">
        <Link href="/" className="hover:underline">Expera</Link>
        <span aria-hidden>/</span>
        <Link href="/biology" className="hover:underline">Biology</Link>
        <span aria-hidden>/</span>
        <Link href="/biology/lab/microscopy" className="hover:underline">Lab</Link>
        <span aria-hidden>/</span>
        <span className="font-semibold text-slate-900">Microscopy</span>
      </nav>
      <BiologyLaboratory data={data} />
    </div>
  );
}
