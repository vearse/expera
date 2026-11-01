import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { EARLY_ACCESS_ROLES } from "@/components/landing/landing-data";

const bodySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  role: z.enum(EARLY_ACCESS_ROLES as unknown as [string, ...string[]]),
  institution: z.string().trim().max(200).optional(),
});

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "early-access.jsonl");

type Entry = z.infer<typeof bodySchema> & { createdAt: string };

async function readEntries(): Promise<Entry[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Entry);
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed.", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (process.env.EARLY_ACCESS_DISABLED === "true") {
    return NextResponse.json(
      {
        error:
          "Early access storage is not configured on this deployment. Set up persistence or remove EARLY_ACCESS_DISABLED to accept submissions.",
      },
      { status: 503 },
    );
  }

  const emailKey = parsed.data.email.toLowerCase();
  const existing = await readEntries();
  if (existing.some((e) => e.email.toLowerCase() === emailKey)) {
    return NextResponse.json({ error: "This email is already registered for early access." }, { status: 409 });
  }

  const entry: Entry = { ...parsed.data, createdAt: new Date().toISOString() };

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, `${JSON.stringify(entry)}\n`, { flag: "a" });
  } catch {
    return NextResponse.json({ error: "Could not save your registration on the server. Try again later." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Thank you — you are on the early-access list. We will be in touch as new laboratories and features launch.",
  });
}
