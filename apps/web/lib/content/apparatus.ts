import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";
import { Apparatus } from "./schemas";

const ROOT = path.join(process.cwd(), "content");

export function loadSubjectApparatus(subject: "physics" | "biology"): Apparatus[] {
  const file = path.join(ROOT, subject, "apparatus.yaml");
  const result = z.array(Apparatus).safeParse(loadYaml(fs.readFileSync(file, "utf8")));
  if (!result.success) {
    throw new Error(`Invalid apparatus content in ${subject}/apparatus.yaml:\n${z.prettifyError(result.error)}`);
  }
  const ids = new Set<string>();
  for (const item of result.data) {
    if (ids.has(item.id)) throw new Error(`${subject}/apparatus.yaml: duplicate apparatus "${item.id}"`);
    ids.add(item.id);
  }
  return result.data;
}
