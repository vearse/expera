import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Repository } from "typeorm";
import { isDatabaseConfigured } from "../config/database";
import type { CreateWaitlistEntryDto } from "./dto/create-waitlist-entry.dto";
import { WaitlistEntry } from "./entities/waitlist-entry.entity";

const SUCCESS_MESSAGE =
  "Thank you — you are on the early-access list. We will be in touch as new laboratories and features launch.";

type FileEntry = CreateWaitlistEntryDto & { createdAt: string };

@Injectable()
export class EarlyAccessService {
  private readonly dataDir =
    process.env.WAITLIST_DATA_DIR?.trim() ||
    path.join(process.cwd(), ".data");
  private readonly dataFile = path.join(this.dataDir, "early-access.jsonl");

  constructor(private readonly waitlistRepo: Repository<WaitlistEntry> | null) {}

  async register(dto: CreateWaitlistEntryDto) {
    if (process.env.EARLY_ACCESS_DISABLED === "true") {
      throw new ServiceUnavailableException(
        "Early access storage is not configured on this deployment. Set up persistence or remove EARLY_ACCESS_DISABLED to accept submissions.",
      );
    }

    if (isDatabaseConfigured() && this.waitlistRepo) {
      return this.registerInDatabase(dto);
    }
    return this.registerInFile(dto);
  }

  private async registerInDatabase(dto: CreateWaitlistEntryDto) {
    const existing = await this.waitlistRepo!.findOne({
      where: { email: dto.email },
      select: ["id"],
    });
    if (existing) {
      throw new ConflictException(
        "This email is already registered for early access.",
      );
    }

    const row = this.waitlistRepo!.create({
      fullName: dto.fullName,
      email: dto.email,
      role: dto.role,
      institution: dto.institution ?? null,
    });

    try {
      await this.waitlistRepo!.save(row);
    } catch (err: unknown) {
      if (isDuplicateKeyError(err)) {
        throw new ConflictException(
          "This email is already registered for early access.",
        );
      }
      throw err;
    }

    return { ok: true as const, message: SUCCESS_MESSAGE };
  }

  private async registerInFile(dto: CreateWaitlistEntryDto) {
    const entries = await this.readFileEntries();
    if (entries.some((e) => e.email.toLowerCase() === dto.email)) {
      throw new ConflictException(
        "This email is already registered for early access.",
      );
    }

    const entry: FileEntry = {
      ...dto,
      createdAt: new Date().toISOString(),
    };

    try {
      await mkdir(this.dataDir, { recursive: true });
      await writeFile(
        this.dataFile,
        `${JSON.stringify(entry)}\n`,
        { flag: "a" },
      );
    } catch {
      throw new ServiceUnavailableException(
        "Could not save your registration on the server. Try again later.",
      );
    }

    return { ok: true as const, message: SUCCESS_MESSAGE };
  }

  private async readFileEntries(): Promise<FileEntry[]> {
    try {
      const raw = await readFile(this.dataFile, "utf8");
      return raw
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as FileEntry);
    } catch {
      return [];
    }
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  return code === "ER_DUP_ENTRY" || code === "23505";
}
