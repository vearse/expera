import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";
import { TEACHER_VOICE_CONFIG } from "@/lib/teacherVoice/config";
import { TeacherMessagesFileSchema, type TeacherMessage } from "@/lib/teacherVoice/types";

const FILE = path.join(process.cwd(), "content", "teacher", "messages.yaml");

export function loadTeacherMessages(): { messages: TeacherMessage[] } {
  const text = fs.readFileSync(FILE, "utf8");
  const parsed = TeacherMessagesFileSchema.safeParse(loadYaml(text));
  if (!parsed.success) {
    throw new Error(`Invalid teacher voice content in content/teacher/messages.yaml:\n${z.prettifyError(parsed.error)}`);
  }

  const seen = new Set<string>();
  const messages = parsed.data.messages.map((message) => {
    if (seen.has(message.id)) throw new Error(`Duplicate teacher voice message id "${message.id}".`);
    seen.add(message.id);
    return {
      ...message,
      priority: message.priority ?? TEACHER_VOICE_CONFIG.priorities[message.kind],
    };
  });

  return { messages };
}
