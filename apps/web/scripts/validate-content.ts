import fs from "node:fs";
import path from "node:path";
import { loadAll } from "../lib/content/load";
import { biologyReviewCount, loadBiology } from "../lib/content/biology";
import { loadPhysics, physicsReviewCount } from "../lib/content/physics";
import { loadPendulum, pendulumReviewCount } from "../lib/content/pendulum";
import { loadSubjectApparatus } from "../lib/content/apparatus";
import { loadTeacherMessages } from "../lib/content/teacherMessages";

try {
  const c = loadAll();
  const biology = loadBiology();
  const physics = loadPhysics();
  const pendulum = loadPendulum();
  const physicsApparatus = loadSubjectApparatus("physics");
  const biologyApparatus = loadSubjectApparatus("biology");
  const teacherVoice = loadTeacherMessages();
  const missingAudio = teacherVoice.messages
    .filter((message) => message.audio)
    .map((message) => message.audio!.replace(/^\//, ""))
    .filter((asset) => !fs.existsSync(path.join(process.cwd(), "public", asset)));
  const pending = [
    c.conventions.review,
    ...c.elements.elements.map((e) => e.review),
    ...c.experiments.map((e) => e.review),
    ...c.qual.cations.map((x) => x.review),
    ...c.qual.anions.map((x) => x.review),
  ].filter((r) => r === "NEEDS_TEACHER_REVIEW").length;
  console.log(
    `Content OK: ${c.elements.elements.length} elements, ${c.experiments.length} experiments, ` +
      `${c.qual.cations.length} cations, ${c.qual.anions.length} anions. ${pending} items NEED TEACHER REVIEW.`,
  );
  console.log(
    `Biology OK: ${biology.microscopy.models.length} microscope models, ${biology.specimens.specimens.length} specimens, ` +
      `${biology.specimens.specimens.reduce((n, s) => n + s.variants.length, 0)} specimen variations, ` +
      `${biology.experiments.experiments.length} experiments, ${biologyApparatus.length} apparatus guides. ${biologyReviewCount(biology)} items NEED TEACHER REVIEW.`,
  );
  console.log(
    `Physics OK: ${physics.stations.length} measurement stations, ${Object.keys(physics.instruments).length} instruments, ` +
      `${Object.keys(physics.samples).length} sample groups, ${physicsApparatus.length} apparatus guides. ${physicsReviewCount(physics)} items NEED TEACHER REVIEW.`,
  );
  console.log(
    `Pendulum OK: ${pendulum.length.minM.toFixed(2)}-${pendulum.length.maxM.toFixed(2)} m, ` +
      `${pendulum.bobs.length} bobs, ${pendulum.gravityPresets.length} gravity presets, ${pendulum.tasks.length} discovery tasks. ` +
      `${pendulumReviewCount(pendulum)} items NEED TEACHER REVIEW.`,
  );
  console.log(
    `Teacher voice OK: ${teacherVoice.messages.length} messages, ` +
      `${teacherVoice.messages.filter((message) => message.status === "approved").length} approved. ` +
      `${missingAudio.length} missing audio files.`,
  );
  if (missingAudio.length) throw new Error(`Missing teacher voice audio files: ${missingAudio.join(", ")}`);
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
