"use client";

import Link from "next/link";
import { LAB_SIMULATIONS, LEARN_ITEMS, PRACTICE_ORDER } from "@/lib/content/catalogue";

export function ProgressMap() {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="font-semibold">Progress map</h2>
      <p className="text-xs text-slate-600">Learn prepares you for Practice. Lab is the interactive simulation.</p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {LEARN_ITEMS.filter((i) => i.practiceId).map((item) => (
          <li key={item.id} className="text-sm">
            <Link href={`/chemistry/learn/${item.id}`} className="text-sky-700 underline">
              {item.title}
            </Link>
            <span className="text-slate-500"> → </span>
            <Link href={`/chemistry/practice/${item.practiceId}`} className="text-sky-700 underline">
              {item.practiceId?.replace(/-/g, " ")}
            </Link>
          </li>
        ))}
        {PRACTICE_ORDER.map((id) => (
          <li key={id} className="text-sm text-slate-600">
            Practice:{" "}
            <Link href={`/chemistry/practice/${id}`} className="text-sky-700 underline">
              {id.replace(/-/g, " ")}
            </Link>
          </li>
        ))}
        {LAB_SIMULATIONS.map((lab) => (
          <li key={lab.id} className="text-sm text-slate-600">
            Lab:{" "}
            <Link href={lab.href} className="text-sky-700 underline">
              {lab.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
