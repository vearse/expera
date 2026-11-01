/** Wave 1 scope rows from Expera.pdf — Learn, Lab, Practice focus per scope. */

export type ScopeMode = "learn" | "lab" | "practice";
export type ScopeStatus = "available" | "in-development" | "planned";

export type WaveScopeRow = {
  id: string;
  wave: 1 | 2 | 3;
  title: string;
  learn: string;
  lab: string;
  practice: string;
  status: Record<ScopeMode, ScopeStatus>;
  learnHref?: string;
  labHref?: string;
  practiceHref?: string;
};

export const CHEMISTRY_WAVE1_SCOPES: WaveScopeRow[] = [
  {
    id: "apparatus-safety",
    wave: 1,
    title: "Laboratory apparatus and safety",
    learn: "Apparatus gallery, hazard symbols, safe-handling rules (2D)",
    lab: "Identify and use apparatus; read burette, pipette and measuring cylinder; handle reagents safely",
    practice: "Regular: apparatus names and uses, hazard symbols. Exam level: precautions and sources of error in a given set-up",
    status: { learn: "planned", lab: "available", practice: "available" },
    labHref: "/chemistry/lab/apparatus",
    practiceHref: "/chemistry/practice/apparatus-safety",
  },
  {
    id: "periodic-table",
    wave: 1,
    title: "Periodic table and atomic structure",
    learn: "Periodic Table explorer (every element); Atom builder (protons, neutrons, electrons, shells, valency, isotopes) (2D)",
    lab: "Flame tests; group trends (Na, K, halogens)",
    practice: "Regular: element facts, electron arrangement, groups and periods, valency. Exam level: isotope data, trends, ionisation energy",
    status: { learn: "available", lab: "planned", practice: "planned" },
    learnHref: "/chemistry/learn/periodic-table",
  },
  {
    id: "bonding-compounds",
    wave: 1,
    title: "Chemical bonding and compounds",
    learn: "Compound builder (formula, name, bond type, properties); Molecules viewer (3D: water, CO₂, ammonia, methane)",
    lab: "Combine bench: mix elements and ions; compare ionic and covalent substances (conductivity, solubility, melting point)",
    practice: "Regular: formulae, names, ionic or covalent. Exam level: bonding diagrams, balancing equations, properties from structure",
    status: { learn: "available", lab: "planned", practice: "planned" },
    learnHref: "/chemistry/learn/compound-bench",
  },
  {
    id: "separation",
    wave: 1,
    title: "Separation of mixtures and purification",
    learn: "Particle view of mixtures and compounds, and why each method works (2D)",
    lab: "Filtration, evaporation and crystallisation, simple and fractional distillation, chromatography, sublimation, decantation, separating funnel",
    practice: "Regular: choose a method for a mixture. Exam level: Rf values, purity tests, labelling set-ups, explaining the method",
    status: { learn: "planned", lab: "in-development", practice: "available" },
    labHref: "/chemistry/lab/separation",
    practiceHref: "/chemistry/practice/separation",
  },
  {
    id: "acids-bases-salts",
    wave: 1,
    title: "Acids, bases and salts",
    learn: "pH scale explorer; particle view of neutralisation (2D)",
    lab: "Indicators (litmus, methyl orange, phenolphthalein); pH of household substances; neutralisation; preparing soluble and insoluble salts",
    practice: "Regular: indicators, pH, properties, types of salt. Exam level: choose a method for a named salt, word and ionic equations",
    status: { learn: "available", lab: "in-development", practice: "available" },
    learnHref: "/chemistry/learn/ph-explorer",
    labHref: "/chemistry/lab/acids-bases-salts",
    practiceHref: "/chemistry/practice/acids-bases-salts",
  },
  {
    id: "titration",
    wave: 1,
    title: "Volumetric analysis (acid-base titration)",
    learn: "Solutions and concentration explorer (mole, molarity, dilution) (2D)",
    lab: "Acid-base titration: standardise a solution, find the titre, calculate the concentration",
    practice: "Regular: concentration, mole and titration calculations. Exam level: unknown concentration from a titre table, percentage purity, multi-step calculations, precautions",
    status: { learn: "planned", lab: "available", practice: "available" },
    learnHref: "/chemistry/learn/solutions-concentration",
    labHref: "/chemistry/lab/titration",
    practiceHref: "/chemistry/practice/titration",
  },
  {
    id: "qualitative-analysis",
    wave: 1,
    title: "Qualitative analysis",
    learn: "Ion test map showing how each cation and anion reacts (2D)",
    lab: "Tests for cations (Na, K, Ca, Mg, Al, Zn, Pb, Fe²⁺, Fe³⁺, Cu²⁺, NH₄⁺), anions (Cl⁻, SO₄²⁻, CO₃²⁻, HCO₃⁻, NO₃⁻, SO₃²⁻) and gases",
    practice: "Regular: a test and its expected observation. Exam level: identify an unknown salt from an observation table and write inferences",
    status: { learn: "planned", lab: "planned", practice: "available" },
    learnHref: "/chemistry/learn/ion-test-map",
    labHref: "/chemistry/lab/qualitative-analysis",
    practiceHref: "/chemistry/practice/qualitative-analysis",
  },
];

export const BIOLOGY_WAVE1_SCOPES: WaveScopeRow[] = [
  {
    id: "cells-microscopy",
    wave: 1,
    title: "Cells and microscopy",
    learn: "Cell explorer: plant and animal cells, organelles, size (2D, optional 3D)",
    lab: "Microscope bench: prepare slides (onion peel, cheek cell, pond water), draw and label, calculate magnification",
    practice: "Regular: organelles and their functions, plant versus animal cells. Exam level: magnification and actual size calculations, drawing and labelling",
    status: { learn: "planned", lab: "available", practice: "planned" },
    labHref: "/biology/lab/microscopy",
  },
  {
    id: "classification-specimens",
    wave: 1,
    title: "Classification and specimen examination",
    learn: "Animal kingdom explorer (Nigerian examples, adaptations, habitats); Plant kingdom explorer (algae, mosses, ferns, conifers, flowering plants)",
    lab: "Specimen bench: observe, draw and label plants, insects, fish and mammals; use a classification key",
    practice: "Regular: characteristics of groups, naming examples. Exam level: identify specimens A, B and C, comparison tables, using keys",
    status: { learn: "planned", lab: "planned", practice: "planned" },
  },
  {
    id: "food-tests",
    wave: 1,
    title: "Food tests and nutrition",
    learn: "Nutrition and food classes explorer: sources, functions, deficiency effects (2D)",
    lab: "Starch (iodine), reducing sugar (Benedict's), protein (Biuret), fats, vitamin C; energy value of food; balanced diet",
    practice: "Regular: food classes, tests and results. Exam level: unknown samples X, Y and Z with tests, observations and inferences",
    status: { learn: "planned", lab: "planned", practice: "planned" },
  },
  {
    id: "osmosis-membranes",
    wave: 1,
    title: "Diffusion, osmosis and membranes",
    learn: "Particle view of diffusion, osmosis and active transport (2D)",
    lab: "Potato strips in solutions; osmometer; plasmolysis and turgor",
    practice: "Regular: definitions and examples. Exam level: interpret mass-change data, plot a graph, find the isotonic point",
    status: { learn: "planned", lab: "planned", practice: "planned" },
  },
  {
    id: "photosynthesis",
    wave: 1,
    title: "Photosynthesis",
    learn: "Plant structure and leaf explorer (2D, 3D flower and leaf optional)",
    lab: "Starch test on a leaf; need for light, chlorophyll and carbon dioxide; oxygen release by pondweed",
    practice: "Regular: raw materials, products, word equation. Exam level: variegated leaf and controlled-variable questions, interpret results",
    status: { learn: "planned", lab: "planned", practice: "planned" },
  },
  {
    id: "human-body",
    wave: 1,
    title: "Human body systems",
    learn: "Human body explorer: digestive, respiratory, circulatory, nervous, excretory, skeletal and reproductive systems (3D with 2D labelled diagrams)",
    lab: "Linked to the food tests, respiration and transport labs",
    practice: "Regular: organs and functions. Exam level: how systems work together, diagram labelling",
    status: { learn: "planned", lab: "planned", practice: "planned" },
  },
];

export function countAvailable(scopes: WaveScopeRow[], mode: ScopeMode): number {
  return scopes.filter((s) => s.status[mode] === "available").length;
}

export const PHYSICS_WAVE1_SCOPES: WaveScopeRow[] = [
  {
    id: "measurement-errors",
    wave: 1,
    title: "Measurement and errors",
    learn: "Units, instruments and accuracy explorer (2D)",
    lab: "Vernier calipers, micrometer screw gauge, metre rule and stopwatch; parallax; density of solids and liquids",
    practice: "Regular: units and reading scales. Exam level: zero error, tables and percentage error",
    status: { learn: "planned", lab: "available", practice: "planned" },
    labHref: "/physics/lab/measurement",
  },
  {
    id: "forces-motion-energy",
    wave: 1,
    title: "Forces, motion and energy basics",
    learn: "Forces and motion explorer: change force and mass, watch speed and acceleration graphs (2D)",
    lab: "Linked to the pendulum and Hooke's law benches",
    practice: "Regular: speed, velocity and acceleration. Exam level: motion graphs and equations of motion",
    status: { learn: "planned", lab: "planned", practice: "planned" },
  },
  {
    id: "pendulum-oscillations",
    wave: 1,
    title: "Simple pendulum and oscillations",
    learn: "Oscillation explorer (2D)",
    lab: "Period against length; find g",
    practice: "Regular: period, frequency and amplitude. Exam level: plot T squared against L and calculate g",
    status: { learn: "planned", lab: "available", practice: "planned" },
    labHref: "/physics/lab/pendulum",
  },
  {
    id: "hookes-law",
    wave: 1,
    title: "Hooke's law and springs",
    learn: "Elasticity explorer (2D)",
    lab: "Extension against load; force constant",
    practice: "Regular: Hooke's law statements. Exam level: plot the graph, find the spring constant and limit of proportionality",
    status: { learn: "planned", lab: "planned", practice: "planned" },
  },
  {
    id: "ohms-law",
    wave: 1,
    title: "Ohm's law and resistance",
    learn: "Electric circuits explorer: build circuits, current, voltage, resistance, series and parallel (2D)",
    lab: "V-I characteristics; resistors in series and parallel",
    practice: "Regular: circuit symbols and Ohm's law. Exam level: resistance from a graph slope and combined resistance",
    status: { learn: "planned", lab: "planned", practice: "planned" },
  },
  {
    id: "light",
    wave: 1,
    title: "Light: reflection, refraction and lenses",
    learn: "Light explorer: ray tracing with mirrors, lenses, prisms and glass blocks (2D)",
    lab: "Plane mirror; refraction through a glass block; focal length of a converging lens",
    practice: "Regular: laws of reflection and refraction. Exam level: refractive index and magnification",
    status: { learn: "planned", lab: "planned", practice: "planned" },
  },
];
