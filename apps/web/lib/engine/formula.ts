export type Composition = Record<string, number>;

/** Count atoms in a formula such as "Al2(SO4)3" or "CuSO4·5H2O". */
export function parseFormula(formula: string): Composition {
  const parts = formula.split(/[·.]/);
  const total: Composition = {};
  for (const part of parts) {
    const m = part.match(/^(\d*)(.*)$/)!;
    const mult = m[1] ? Number(m[1]) : 1;
    add(total, parseGroup(m[2]), mult);
  }
  return total;
}

function parseGroup(s: string): Composition {
  const stack: Composition[] = [{}];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "(") {
      stack.push({});
      i++;
    } else if (ch === ")") {
      i++;
      const n = readNumber(s, i);
      i = n.next;
      const inner = stack.pop()!;
      add(stack[stack.length - 1], inner, n.value);
    } else if (/[A-Z]/.test(ch)) {
      let sym = ch;
      i++;
      if (i < s.length && /[a-z]/.test(s[i])) sym += s[i++];
      const n = readNumber(s, i);
      i = n.next;
      add(stack[stack.length - 1], { [sym]: 1 }, n.value);
    } else {
      throw new Error(`Cannot read formula "${s}" at "${ch}"`);
    }
  }
  if (stack.length !== 1) throw new Error(`Unbalanced brackets in "${s}"`);
  return stack[0];
}

function readNumber(s: string, i: number) {
  let j = i;
  while (j < s.length && /\d/.test(s[j])) j++;
  return { value: j > i ? Number(s.slice(i, j)) : 1, next: j };
}

function add(into: Composition, from: Composition, mult: number) {
  for (const [k, v] of Object.entries(from)) into[k] = (into[k] ?? 0) + v * mult;
}

export function molarMass(formula: string, masses: Record<string, number>): number {
  let sum = 0;
  for (const [el, n] of Object.entries(parseFormula(formula))) {
    const m = masses[el];
    if (m === undefined) throw new Error(`No exam atomic mass for ${el}`);
    sum += m * n;
  }
  return Math.round(sum * 100) / 100;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export type IonSpec = { symbol: string; charge: number; polyatomic: boolean };

/** Ionic formula by balancing charges, e.g. Al3+ and SO4 2- give Al2(SO4)3. */
export function ionicFormula(cation: IonSpec, anion: IonSpec): { formula: string; nCation: number; nAnion: number } {
  const c = cation.charge;
  const a = -anion.charge;
  const l = (c * a) / gcd(c, a);
  const nCation = l / c;
  const nAnion = l / a;
  const part = (ion: IonSpec, n: number) => (n === 1 ? ion.symbol : ion.polyatomic ? `(${ion.symbol})${n}` : `${ion.symbol}${n}`);
  return { formula: part(cation, nCation) + part(anion, nAnion), nCation, nAnion };
}

export type Side = { formula: string; coefficient: number }[];

/** Atom totals on one side of an equation. */
export function sideTotals(side: Side): Composition {
  const total: Composition = {};
  for (const s of side) add(total, parseFormula(s.formula), s.coefficient);
  return total;
}

export function isBalanced(left: Side, right: Side): boolean {
  if ([...left, ...right].some((s) => !Number.isInteger(s.coefficient) || s.coefficient < 1)) return false;
  const l = sideTotals(left);
  const r = sideTotals(right);
  const keys = new Set([...Object.keys(l), ...Object.keys(r)]);
  return [...keys].every((k) => l[k] === r[k]);
}

/** Electron arrangement for the first 20 elements (2, 8, 8, 2 shell filling used in SS chemistry). */
export function shellsUpTo20(electrons: number): number[] {
  const caps = [2, 8, 8, 2];
  const shells: number[] = [];
  let left = electrons;
  for (const cap of caps) {
    if (left <= 0) break;
    const n = Math.min(cap, left);
    shells.push(n);
    left -= n;
  }
  return shells;
}

/** Valency of a main-group element from its outer electrons (Z ≤ 20). */
export function valencyFromOuter(outer: number, shells: number): number {
  if ((shells === 1 && outer === 2) || outer === 8) return 0;
  return outer <= 4 ? outer : 8 - outer;
}
