import { NextResponse } from "next/server";
import { getModuleDetail } from "@/lib/modules/getModuleDetail";
import type { ModuleKind, ModuleSubject } from "@/lib/modules/types";

type RouteParams = { subject: string; kind: string; moduleId: string };

function parseParams(raw: RouteParams): { subject: ModuleSubject; kind: ModuleKind; id: string } | null {
  const { subject, kind, moduleId: id } = raw;
  if (subject !== "chemistry" && subject !== "biology" && subject !== "physics") return null;
  if (kind !== "learn" && kind !== "lab") return null;
  if (!id) return null;
  return { subject, kind, id };
}

/** Public modules API — same payload topic pages use; swap server catalogue for upstream API via env. */
export async function GET(_request: Request, context: { params: Promise<RouteParams> }) {
  const parsed = parseParams(await context.params);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid subject or module kind" }, { status: 400 });
  }

  const detail = await getModuleDetail(parsed);
  if (!detail) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  return NextResponse.json(detail, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
