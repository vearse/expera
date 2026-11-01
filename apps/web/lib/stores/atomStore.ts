import { createStore } from "zustand/vanilla";
import { shellsUpTo20 } from "@/lib/engine/formula";

export type AtomState = { protons: number; neutrons: number; electrons: number };

export type AtomActions =
  | { type: "setProtons"; value: number }
  | { type: "setNeutrons"; value: number }
  | { type: "setElectrons"; value: number }
  | { type: "addParticle"; particle: "proton" | "neutron" | "electron" }
  | { type: "loadMission"; protons: number; neutrons: number; electrons: number };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function createAtomStore(initial: AtomState = { protons: 11, neutrons: 12, electrons: 11 }) {
  return createStore<AtomState & { dispatch: (a: AtomActions) => void }>((set) => ({
    ...initial,
    dispatch: (a) =>
      set((s) => {
        switch (a.type) {
          case "setProtons":
            return { ...s, protons: clamp(a.value, 1, 20) };
          case "setNeutrons":
            return { ...s, neutrons: clamp(a.value, 0, 26) };
          case "setElectrons":
            return { ...s, electrons: clamp(a.value, 0, 20) };
          case "addParticle":
            if (a.particle === "proton") return { ...s, protons: clamp(s.protons + 1, 1, 20) };
            if (a.particle === "neutron") return { ...s, neutrons: clamp(s.neutrons + 1, 0, 26) };
            return { ...s, electrons: clamp(s.electrons + 1, 0, 20) };
          case "loadMission":
            return { protons: a.protons, neutrons: a.neutrons, electrons: a.electrons };
          default:
            return s;
        }
      }),
  }));
}

export function selectShells(state: AtomState) {
  return shellsUpTo20(state.electrons);
}

export const ATOM_MISSIONS = [
  { id: "na-23", title: "Build sodium-23", protons: 11, neutrons: 12, electrons: 11, xp: 10 },
  { id: "cl-ion", title: "Make a Cl− ion", protons: 17, neutrons: 18, electrons: 18, xp: 10 },
  { id: "c-14", title: "Make carbon-14", protons: 6, neutrons: 8, electrons: 6, xp: 10 },
] as const;

export function missionComplete(state: AtomState, m: (typeof ATOM_MISSIONS)[number]) {
  return state.protons === m.protons && state.neutrons === m.neutrons && state.electrons === m.electrons;
}
