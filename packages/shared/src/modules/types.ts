export type ModuleSubject = "chemistry" | "biology" | "physics";
export type ModuleKind = "learn" | "lab";

export type ModuleRef = {
  kind: ModuleKind;
  id: string;
  title: string;
};

/** Serializable module detail — same shape a future modules API will return. */
export type ModuleDetail = {
  id: string;
  subject: ModuleSubject;
  kind: ModuleKind;
  title: string;
  curriculumScope: string;
  objective: string;
  purpose: string;
  view: string;
  wave: 1 | 2 | 3;
  grades: string;
  durationMinutes?: number;
  difficulty?: "Beginner" | "Medium" | "Advanced";
  examAlignment?: string;
  /** Whether `/run` is implemented today. */
  runAvailable: boolean;
  proTip?: string;
  guidedMode?: string;
  exploreMode?: string;
  apparatusAndReagents?: string;
  mistakesToDetect?: string[];
  preparesFor?: string;
  prerequisites?: ModuleRef[];
  relatedPracticeIds?: string[];
};

export type ModuleDetailParams = {
  subject: ModuleSubject;
  kind: ModuleKind;
  id: string;
};
