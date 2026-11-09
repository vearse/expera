import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { nestApiUrl } from "@/lib/api/nestBase";
import {
  earlyAccessBodySchema,
  getEarlyAccessApiBase,
} from "@/lib/waitlist/submitEarlyAccess";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "early-access.jsonl");

type Entry = ReturnType<typeof earlyAccessBodySchema.parse> & { createdAt: string };

const SUCCESS_MESSAGE =
  "Thank you — you are on the early-access list. We will be in touch as new laboratories and features launch.";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = earlyAccessBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 400 },
    );
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

  const apiBase = getEarlyAccessApiBase();
  if (apiBase) {
    return proxyToNest(apiBase, parsed.data, req);
  }

  return saveLocally(parsed.data);
}

async function proxyToNest(
  apiBase: string,
  body: ReturnType<typeof earlyAccessBodySchema.parse>,
  req: Request,
) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  try {
    const upstream = await fetch(nestApiUrl(apiBase, "early-access"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
        ...(realIp ? { "X-Real-IP": realIp } : {}),
      },
      body: JSON.stringify({
        ...body,
        email: body.email.toLowerCase(),
      }),
      signal: AbortSignal.timeout(12_000),
    });

    const text = await upstream.text();
    let data: Record<string, unknown> = {};
    if (text) {
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        data = { error: "Unexpected response from waitlist service." };
      }
    }

    if (!upstream.ok) {
      const error =
        typeof data.error === "string"
          ? data.error
          : upstream.status === 429
            ? "Too many attempts. Please wait a minute and try again."
            : "Something went wrong. Try again shortly.";
      return NextResponse.json(
        { error, ...(data.issues ? { issues: data.issues } : {}) },
        { status: upstream.status },
      );
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Waitlist service is unreachable. Try again shortly." },
      { status: 503 },
    );
  }
}

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

async function saveLocally(body: ReturnType<typeof earlyAccessBodySchema.parse>) {
  const emailKey = body.email.toLowerCase();
  const existing = await readEntries();
  if (existing.some((e) => e.email.toLowerCase() === emailKey)) {
    return NextResponse.json(
      { error: "This email is already registered for early access." },
      { status: 409 },
    );
  }

  const entry: Entry = { ...body, email: emailKey, createdAt: new Date().toISOString() };

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, `${JSON.stringify(entry)}\n`, { flag: "a" });
  } catch {
    return NextResponse.json(
      { error: "Could not save your registration on the server. Try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
}
