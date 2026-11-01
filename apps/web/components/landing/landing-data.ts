export type FeatureStatus = "available" | "in-development" | "coming-soon" | "planned";

export const STATUS_LABEL: Record<FeatureStatus, string> = {
  available: "Available",
  "in-development": "In development",
  "coming-soon": "Coming soon",
  planned: "Planned expansion",
};

export const NAV_LINKS = [
  { href: "#top", label: "Home" },
  { href: "#experience", label: "Explore" },
  { href: "#subjects", label: "Subjects" },
  { href: "#schools", label: "For schools" },
  { href: "#about", label: "About" },
] as const;

export const ENVIRONMENTS = [
  {
    id: "learn",
    title: "Learn",
    tagline: "Understand the ideas",
    description:
      "Explore concepts through interactive visual experiences that make complex scientific ideas easier to understand.",
    status: "available" as FeatureStatus,
    detail: "Chemistry learning explorers are live; more subjects and levels are expanding.",
  },
  {
    id: "lab",
    title: "Lab",
    tagline: "Run the experiment",
    description:
      "Step into virtual laboratories. Handle equipment, conduct experiments, test variables and observe scientific outcomes.",
    status: "available" as FeatureStatus,
    detail: "Chemistry apparatus and titration labs, plus Biology microscopy, are available now.",
    featured: true,
  },
  {
    id: "practice",
    title: "Practice",
    tagline: "Reinforce your skills",
    description: "Reinforce what you learn through topic-based questions and practical exercises.",
    status: "available" as FeatureStatus,
    detail: "Guided Chemistry practicals are available through the Practice environment.",
  },
  {
    id: "exam",
    title: "Exam",
    tagline: "Prepare with purpose",
    description: "Prepare for important examinations through structured mock assessments and examination practice.",
    status: "coming-soon" as FeatureStatus,
    detail: "Structured mock assessments are in development; Practice covers guided exam-style preparation today.",
  },
] as const;

export const CHEMISTRY_LABS = [
  {
    title: "Apparatus laboratory",
    description: "Explore a virtual laboratory storeroom, handle equipment and assemble practical setups.",
    href: "/chemistry/lab/apparatus",
    status: "available" as FeatureStatus,
  },
  {
    title: "Acid-base titration",
    description: "Operate the burette and pipette, perform a titration and observe the endpoint.",
    href: "/chemistry/lab/titration",
    status: "available" as FeatureStatus,
  },
] as const;

export const PLANNED_LABS = [
  {
    subject: "Chemistry",
    title: "Separation and purification",
    status: "in-development" as FeatureStatus,
  },
  {
    subject: "Physics",
    title: "Measurement and experimental errors",
    status: "in-development" as FeatureStatus,
  },
  {
    subject: "Biology",
    title: "Additional microscopy and specimen activities",
    status: "planned" as FeatureStatus,
  },
] as const;

export const WAVE1_SUBJECTS = [
  {
    id: "chemistry",
    name: "Chemistry",
    accent: "chemistry" as const,
    status: "available" as FeatureStatus,
    statusNote: "Selected laboratories and learning explorers available.",
    topics: [
      "Apparatus and laboratory equipment",
      "Chemical reactions and practical experiments",
      "Acid-base titration",
      "Separation and purification (planned)",
    ],
    href: "/chemistry",
  },
  {
    id: "physics",
    name: "Physics",
    accent: "physics" as const,
    status: "in-development" as FeatureStatus,
    statusNote: "Wave 1 development.",
    topics: ["Measurement", "Mechanics", "Motion", "Electricity", "Waves", "Optics"],
    href: null,
  },
  {
    id: "biology",
    name: "Biology",
    accent: "biology" as const,
    status: "available" as FeatureStatus,
    statusNote: "Microscopy laboratory available; broader Wave 1 scope in development.",
    topics: [
      "Cells and microscopy",
      "Specimen observation",
      "Biological structures",
      "Human biology",
      "Plant biology",
      "Ecology",
    ],
    href: "/biology",
  },
] as const;

export const FUTURE_SUBJECTS = [
  "Mathematics",
  "Computer science",
  "Agricultural science",
  "Basic science and technology",
  "Environmental science",
  "Engineering and applied sciences",
] as const;

export const STAGES = [
  {
    title: "Primary education",
    description: "Introduce foundational scientific concepts through age-appropriate interactive experiences.",
    status: "planned" as FeatureStatus,
  },
  {
    title: "Junior secondary",
    description: "Develop curiosity and understanding through introductory scientific exploration and practical activities.",
    status: "in-development" as FeatureStatus,
  },
  {
    title: "Senior secondary",
    description: "Support curriculum-aligned science education, laboratory experiments and examination preparation.",
    status: "available" as FeatureStatus,
  },
  {
    title: "Tertiary and ND",
    description: "Expand into more advanced scientific practicals, measurements and technical simulations.",
    status: "planned" as FeatureStatus,
  },
] as const;

export const BENEFITS = [
  {
    title: "Hands-on digital experiments",
    body: "Students interact with virtual scientific equipment and conduct experiments in guided laboratory environments.",
  },
  {
    title: "More opportunities to practise",
    body: "Repeat processes, adjust variables and explore outcomes without waiting for a single shared physical setup.",
  },
  {
    title: "Learn by observation",
    body: "See how changing conditions affects results — from titration endpoints to specimen focus under the microscope.",
  },
  {
    title: "Designed for Nigerian education",
    body: "Built with Nigerian curriculum requirements and examination expectations in mind, with room to grow internationally.",
  },
  {
    title: "Accessible across devices",
    body: "Use Expera on desktop, tablet and mobile — wherever students can focus and explore safely.",
  },
  {
    title: "A safer way to explore selected experiments",
    body: "Practise approved simulations without physical exposure to materials used in corresponding laboratory work. Virtual labs complement — they do not replace — appropriate physical instruction.",
  },
] as const;

export const EXAMS = ["WAEC", "NECO", "JAMB", "BECE"] as const;

export const FAQS = [
  {
    q: "What is Expera?",
    a: "Expera is an interactive STEM learning platform with virtual laboratories. Students explore scientific concepts, perform digital experiments, practise skills and prepare for examinations — starting with Nigerian curriculum science.",
  },
  {
    q: "Is Expera designed for Nigerian students?",
    a: "Yes. Expera is being developed with the Nigerian educational curriculum and examination context in mind, while remaining open to broader standards over time.",
  },
  {
    q: "Which subjects are currently available?",
    a: "Chemistry includes multiple Learn explorers, Practice practicals, and two interactive Lab simulations (apparatus and acid-base titration). Biology includes a cells and microscopy laboratory. Physics laboratories are in Wave 1 development.",
  },
  {
    q: "What is the difference between Learn and Lab?",
    a: "Learn is where students understand concepts through interactive exploration. Lab is where they experiment — handling equipment, running procedures and observing outcomes. They are complementary, not interchangeable.",
  },
  {
    q: "Can students perform actual experiments?",
    a: "Students perform interactive digital experiments that model real laboratory procedures and scientific behaviour. These experiences support practical understanding alongside classroom teaching.",
  },
  {
    q: "Does Expera replace physical school laboratories?",
    a: "No. Expera extends access to practical experiences and helps students prepare for real laboratory work. Schools should continue appropriate physical practical instruction where required.",
  },
  {
    q: "Can schools use Expera?",
    a: "Yes. Schools can explore Expera with students and discuss partnership options as institutional features evolve. Contact us through the early-access form with the school representative role.",
  },
  {
    q: "Is Expera available on mobile devices?",
    a: "Expera is designed to work across desktop, tablet and mobile browsers. Some intensive 3D laboratories work best on larger screens.",
  },
  {
    q: "Which examinations does Expera support?",
    a: "Content is mapped toward WAEC, NECO, JAMB and BECE expectations where relevant. Expera does not claim endorsement or certification by any examination body.",
  },
  {
    q: "Are more subjects coming?",
    a: "Yes. Wave 1 focuses on core science subjects. Mathematics, computer science, agricultural science and other disciplines are planned platform expansion areas.",
  },
  {
    q: "Can parents register their children?",
    a: "Parents can join early access and explore Expera with their children. Student accounts and family features will expand as the platform grows.",
  },
  {
    q: "How can a school partner with Expera?",
    a: "Use the early-access form and select School representative, or email contact details from the footer when published. We will follow up to discuss access and partnership.",
  },
] as const;

export const EARLY_ACCESS_ROLES = [
  "Student",
  "Parent or guardian",
  "Teacher or educator",
  "School representative",
  "University or tertiary student",
  "Professional",
  "Other",
] as const;
