/** Wave 1 Chemistry catalogue. Practice holds the guided practicals. Lab holds the simulations. */
export const LEARN_ITEMS = [
  { id: "periodic-table", title: "Periodic Table explorer", view: "2D + 3D", practiceId: null as string | null, leadsInto: "Every chemistry practical" },
  { id: "atom-builder", title: "Atom builder", view: "2D + 3D", practiceId: "qualitative-analysis", leadsInto: "Qualitative analysis" },
  { id: "compound-bench", title: "Compound builder", view: "2D + 3D", practiceId: "acids-bases-salts", leadsInto: "Acids, bases and salts; titration; qualitative analysis" },
  { id: "ph-explorer", title: "Acids, bases and the pH scale", view: "2D + 3D", practiceId: "titration", leadsInto: "Acids, bases and salts; titration" },
  { id: "molecules", title: "Molecules and bonding viewer", view: "3D (2D fallback)", practiceId: null, leadsInto: "Acids, bases and salts" },
] as const;

export const PRACTICE_ORDER = ["apparatus-safety", "separation", "acids-bases-salts", "titration", "qualitative-analysis"] as const;

/** @deprecated use PRACTICE_ORDER */
export const LAB_ORDER = PRACTICE_ORDER;

export const LAB_SIMULATIONS = [
  { id: "apparatus", title: "Apparatus Laboratory", href: "/chemistry/lab/apparatus", summary: "Explore a full 3D storeroom, drag apparatus onto the bench, and assemble setups." },
  { id: "titration", title: "Acid-base titration laboratory", href: "/chemistry/lab/titration", summary: "Run a titration by handling the burette, pipette, and flask." },
] as const;

export const EXAM_TOPICS = [
  "WAEC / NECO style practical questions",
  "JAMB objective items from lab simulations",
  "Timed, examiner-style feedback",
] as const;
