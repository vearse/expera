import type { Element } from "@/lib/content/schemas";
import type { IonInfo } from "@/lib/content/schemas";

export type CombineToken = { kind: "cation" | "anion" | "element"; id: string; symbol: string; charge?: number; element?: Element };

export type CombineResult =
  | { ok: true; formula: string; name: string; bondType: "ionic" | "covalent" }
  | { ok: false; reason: string };

const NOBLE_Z = new Set([2, 10, 18, 36, 54, 86, 118]);

export function combinePair(a: CombineToken, b: CombineToken, cations: IonInfo[], anions: IonInfo[], moleculeIds: Set<string>): CombineResult {
  if (a.kind === "element" && b.kind === "element") {
    const ea = a.element!;
    const eb = b.element!;
    if (NOBLE_Z.has(ea.atomicNumber) || NOBLE_Z.has(eb.atomicNumber)) return { ok: false, reason: "Noble gases have a full outer shell and do not form compounds this way." };
    if (ea.type === "metal" && eb.type === "metal") return { ok: false, reason: "Two metals form a mixture or alloy, not a simple compound in this builder." };
    if (ea.type !== "metal" && eb.type !== "metal") {
      const key = [ea.symbol, eb.symbol].sort().join("-");
      if (!moleculeIds.has(key) && !moleculeIds.has(`${ea.symbol}${eb.symbol}`) && !moleculeIds.has(`${eb.symbol}${ea.symbol}`)) {
        return { ok: false, reason: "This pair of non-metals is not in our library yet." };
      }
      return { ok: true, formula: "See molecule library", name: `${ea.name} + ${eb.name}`, bondType: "covalent" };
    }
  }
  const cat = a.kind === "cation" ? a : b.kind === "cation" ? b : null;
  const an = a.kind === "anion" ? a : b.kind === "anion" ? b : null;
  if (cat && an) {
    if (a.kind === "cation" && b.kind === "cation") return { ok: false, reason: "Two cations (like charges) cannot combine into one ionic compound." };
    if (a.kind === "anion" && b.kind === "anion") return { ok: false, reason: "Two anions (like charges) cannot combine into one ionic compound." };
    const cInfo = cations.find((x) => x.id === cat.id);
    const aInfo = anions.find((x) => x.id === an.id);
    if (!cInfo || !aInfo) return { ok: false, reason: "Unknown ion." };
    const cCharge = Math.abs(cInfo.charge);
    const aCharge = Math.abs(aInfo.charge);
    const lcm = (cCharge * aCharge) / gcd(cCharge, aCharge);
    const cSub = lcm / cCharge;
    const aSub = lcm / aCharge;
    const formula = formatIonFormula(cInfo.symbol, cSub, aInfo.symbol, aSub);
    return { ok: true, formula, name: `${cInfo.name} ${aInfo.name}`, bondType: "ionic" };
  }
  return { ok: false, reason: "Pick a cation and an anion, or two non-metal elements from the library." };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function formatIonFormula(cSym: string, cSub: number, aSym: string, aSub: number) {
  const cPart = sub(cSym, cSub);
  const aPart = sub(aSym, aSub);
  return `${cPart}${aPart}`;
}

function sub(sym: string, n: number) {
  if (n === 1) return sym;
  return `${sym}${n}`;
}
