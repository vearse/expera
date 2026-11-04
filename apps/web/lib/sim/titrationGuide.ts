import { currentPH, endpointVolume, type TitrationAction, type TitrationState } from "./titrationStore";
import type { GuidedStep } from "./guidedSimulation";

export type TitrationInteractionPoint = {
  position: [number, number, number];
  radius: number;
};

/**
 * Anchors are expressed in the same world coordinates as TitrationBench3D.
 * They are keyed by `apparatusId:interactionPoint` so the guided engine and
 * the 3D scene can share one source of truth.
 */
export const TITRATION_INTERACTION_POINTS: Record<string, TitrationInteractionPoint> = {
  "burette:top": { position: [0.22, 2.4, 0.4], radius: 0.13 },
  "burette:tap": { position: [0.22, 1.43, 0.48], radius: 0.1 },
  "burette:scale": { position: [0.22, 1.92, 0.47], radius: 0.12 },
  "pipette:filler": { position: [0.92, 1.5, 0.74], radius: 0.14 },
  "indicator-bottle:bottle": { position: [1.28, 1.32, 0.76], radius: 0.13 },
  "conical-flask:body": { position: [0.22, 1.18, 0.42], radius: 0.13 },
  "white-tile:surface": { position: [0.58, 1.08, 0.47], radius: 0.12 },
};

const endpoint = (state: TitrationState) => endpointVolume(state);

const coarseEnough = (state: TitrationState) => state.deliveredToFlask >= Math.max(0, endpoint(state) - 1);

const pastEndPoint = (state: TitrationState) => {
  const ph = currentPH(state);
  return (ph !== null && ph <= 8.2) || state.deliveredToFlask >= endpoint(state);
};

export const TITRATION_GUIDED_STEPS: Array<GuidedStep<TitrationState, TitrationAction>> = [
  {
    id: "rinse-burette",
    title: "Rinse the burette",
    instruction: "Click the top of the burette to rinse it with a little acid.",
    why: "A rinse removes water left from washing so it cannot dilute the acid and change the titre.",
    hint: "The pointer is on the mouth at the top of the burette.",
    targets: [{ apparatusId: "burette", interactionPoint: "top", label: "top of the burette", pointerLabel: "Rinse here", action: { type: "rinse" } }],
    complete: (state) => state.rinsed,
  },
  {
    id: "fill-burette",
    title: "Fill the burette",
    instruction: "Click the top of the burette to fill it with acid.",
    why: "Fill just above the zero mark so the whole scale can be used.",
    hint: "Use the pointer at the top of the burette, then watch the liquid rise.",
    targets: [{ apparatusId: "burette", interactionPoint: "top", label: "top of the burette", pointerLabel: "Fill here", action: { type: "fill" } }],
    complete: (state) => state.filled,
  },
  {
    id: "remove-air-bubble",
    title: "Clear the jet",
    instruction: "Click the tap and jet to remove the air bubble from the burette tip.",
    why: "An air bubble counts as acid on the scale but never reaches the flask.",
    hint: "The highlight is on the green tap near the bottom of the burette.",
    targets: [{ apparatusId: "burette", interactionPoint: "tap", label: "burette tap", pointerLabel: "Clear the jet here", action: { type: "removeBubble" } }],
    complete: (state) => state.bubbleRemoved,
  },
  {
    id: "record-initial",
    title: "Record the initial reading",
    instruction: "Click the burette scale to read the starting level at eye level.",
    why: "Read the bottom of the meniscus with your eye level with it to avoid parallax error.",
    hint: "Use the scale, then choose the eye-level view before recording.",
    targets: [{ apparatusId: "burette", interactionPoint: "scale", label: "burette scale", pointerLabel: "Read here", kind: "reading", reading: "initial" }],
    complete: (state) => state.initialRecorded !== null,
  },
  {
    id: "pipette-base",
    title: "Pipette the base",
    instruction: "Click the pipette filler to transfer exactly the base into the conical flask.",
    why: "A pipette filler is the safe way to draw up alkali; never use your mouth.",
    hint: "The pipette and its rubber filler are beside the conical flask.",
    targets: [
      {
        apparatusId: "pipette",
        interactionPoint: "filler",
        label: "pipette filler",
        pointerLabel: "Pipette here",
        action: { type: "pipette", method: "filler" },
      },
    ],
    secondaryActions: [
      {
        label: "Try pipetting by mouth",
        action: { type: "pipette", method: "mouth" },
        variant: "danger",
        note: "Unsafe alternative — watch the safety response.",
      },
    ],
    complete: (state) => state.baseInFlask,
  },
  {
    id: "add-indicator",
    title: "Add the indicator",
    instruction: "Click the indicator bottle to pick it up, then click the conical flask to add two drops.",
    why: "The indicator makes the end point visible. Two drops are enough.",
    hint: "Pick up the bottle first; the pointer will then move to the flask.",
    targets: [
      { apparatusId: "indicator-bottle", interactionPoint: "bottle", label: "indicator bottle", pointerLabel: "Pick up here" },
      {
        apparatusId: "conical-flask",
        interactionPoint: "body",
        label: "conical flask",
        pointerLabel: "Add drops here",
        action: [{ type: "addIndicator" }, { type: "addIndicator" }],
      },
    ],
    complete: (state) => state.indicatorDrops >= 2,
  },
  {
    id: "white-tile",
    title: "Use the white tile",
    instruction: "Click the white tile to stand the flask on it.",
    why: "A white background makes the first permanent colour change easier to see.",
    hint: "The tile is next to the flask on the bench.",
    targets: [{ apparatusId: "white-tile", interactionPoint: "surface", label: "white tile", pointerLabel: "Place tile here", action: { type: "setTile", on: true } }],
    complete: (state) => state.onTile,
  },
  {
    id: "swirl-flask",
    title: "Swirl the flask",
    instruction: "Click the conical flask to swirl the mixture.",
    why: "Swirling mixes the acid with the alkali so the colour change is even.",
    hint: "Click the body of the conical flask.",
    targets: [{ apparatusId: "conical-flask", interactionPoint: "body", label: "conical flask", pointerLabel: "Swirl here", action: { type: "swirl" } }],
    complete: (state) => state.swirled,
  },
  {
    id: "run-in-acid",
    title: "Run in the acid",
    instruction: "Click the burette tap to run acid into the flask. Swirl after each addition.",
    why: "A rough titration finds the end point quickly; near it you must slow down.",
    hint: "Keep clicking the tap. Use the 5 cm³ shortcut while you are still far from the end point.",
    targets: [{ apparatusId: "burette", interactionPoint: "tap", label: "burette tap", pointerLabel: "Add acid here", action: { type: "deliver", cm3: 1 } }],
    contextActions: [
      {
        label: "Run in 5 cm³",
        action: { type: "deliver", cm3: 5 },
        when: (state) => state.deliveredToFlask < endpoint(state) - 7,
      },
    ],
    repeat: true,
    complete: coarseEnough,
  },
  {
    id: "fine-end-point",
    title: "Find the end point",
    instruction: "Add acid one drop at a time. Stop at the first permanent colour change.",
    why: "Near the end point a single drop can change the colour, so you must add drops slowly and swirl.",
    hint: "Click the tap for one drop, swirl, and watch the flask colour.",
    targets: [{ apparatusId: "burette", interactionPoint: "tap", label: "burette tap", pointerLabel: "Add a drop here", action: { type: "deliver", cm3: 0.05 } }],
    repeat: true,
    complete: pastEndPoint,
  },
  {
    id: "record-final",
    title: "Record the final reading",
    instruction: "Click the burette scale to record the final level at eye level.",
    why: "The titre is the final reading minus the initial reading, both taken at eye level.",
    hint: "Use the scale, check your eye level, then record the final reading.",
    targets: [{ apparatusId: "burette", interactionPoint: "scale", label: "burette scale", pointerLabel: "Read here", kind: "reading", reading: "final" }],
    complete: (state) => state.rows.length > state.trialIndex,
  },
  {
    id: "next-trial",
    title: "Start the next titre",
    instruction: "This titre is recorded. Start the next trial when you are ready.",
    why: "Repeat the titration until you have concordant titres, then average them.",
    hint: "Use the button in this panel to begin the next trial.",
    complete: (state) => state.finished || state.rows.length <= state.trialIndex,
    contextActions: [{ label: "Start next titre", action: { type: "nextTrial" }, variant: "primary" }],
  },
];
