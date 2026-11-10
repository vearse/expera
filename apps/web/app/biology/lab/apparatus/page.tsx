import type { Metadata } from "next";
import Link from "next/link";
import { loadSubjectApparatus } from "@/lib/content/apparatus";
import { ApparatusInventory } from "@/components/lab/ApparatusInventory";
import { LabExperience } from "@/components/lab/LabExperience";

export const metadata: Metadata = {
  title: "Biology apparatus laboratory · Expera Biology",
  description: "Explore the Biology apparatus and specimen materials used in school practicals, including the compound microscope, slides, coverslips, forceps, stains and specimen jars.",
};

export default function BiologyApparatusPage() {
  const apparatus = loadSubjectApparatus("biology");

  return (
    <LabExperience title="Biology apparatus" subject="Biology">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 pb-20 pt-6 md:px-8">
        <header className="grid gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-5 lab-card-elevation">
          <Link href="/biology?tab=lab" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">← Biology Lab</Link>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Biology · Apparatus guide</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Biology apparatus laboratory</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-secondary">
            Learn the equipment and specimen materials used at the microscopy bench. Click an item in the 3D storeroom for a short reminder inside the room, then read the full guide below. The plain list keeps every guide available when 3D is unavailable.
          </p>
        </header>

        <ApparatusInventory items={apparatus} title="Biology apparatus store" subject="biology" />
      </div>
    </LabExperience>
  );
}
