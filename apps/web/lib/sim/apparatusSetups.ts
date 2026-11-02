export type SetupId = "titration" | "filtration";

export const APPARATUS_SETUP_DEFINITIONS: Record<
  SetupId,
  { title: string; required: string[]; summary: string }
> = {
  titration: {
    title: "Titration",
    required: ["retort-stand", "burette", "conical-flask", "white-tile"],
    summary: "Clamp the burette over the conical flask on a white tile.",
  },
  filtration: {
    title: "Filtration",
    required: ["filter-funnel", "beaker"],
    summary: "Filter funnel in the beaker to collect filtrate.",
  },
};
