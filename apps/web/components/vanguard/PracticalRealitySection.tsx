"use client";

type Block = {
  kicker: string;
  title: string;
  lead: string;
  body: string;
  panel: string;
  leadTone: string;
  image: { src: string; alt: string };
};

const BLOCKS: Block[] = [
  {
    kicker: "Repetition without fear",
    title: "Master techniques through unconstrained practice.",
    lead: "Unlimited trials. 100% hazard-free.",
    body: "When students only reach a physical laboratory in the final week before WAEC, anxiety replaces inquiry. Expera gives every student a personal bench they can repeat — five, ten, or twenty titrations — until the procedure feels ordinary.",
    panel: "bg-wash-cyan",
    leadTone: "text-[#0e7490]",
    image: {
      src: "/landing/hero-titration.png",
      alt: "Nigerian secondary school students examining titration readings",
    },
  },
  {
    kicker: "Error elimination",
    title: "Diagnose parallax errors and air bubbles in real time.",
    lead: "Students spotted the meniscus error on a Lagos mock exam after practising with Expera’s digital gauge.",
    body: "WAEC Paper 3 penalises trapped air under the burette stopcock, a misread meniscus, and a flask that was never swirled. The simulation flags those mistakes the moment they happen.",
    panel: "bg-accent-soft",
    leadTone: "text-[#1d4ed8]",
    image: {
      src: "/landing/hero-microscopy.png",
      alt: "Student using a microscope in a Nigerian secondary school",
    },
  },
  {
    kicker: "Built for local realities",
    title: "Keep practicals running on shared tablets and modest labs.",
    lead: "Under 2 MB per scene. Chromebook and web — nothing to install.",
    body: "Engineered from Lagos for schools where power, water, and bandwidth come and go. Scenes stay light enough for Android tablets, a projector, and a computer lab that drops offline.",
    panel: "bg-wash-orange",
    leadTone: "text-[#c2410c]",
    image: {
      src: "/landing/hero-classroom.png",
      alt: "Teacher leading a classroom practical with secondary students",
    },
  },
];

export function PracticalRealitySection() {
  return (
    <section id="reality" className="bg-white py-20 lg:py-20">
      <div className="vanguard-container">
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
          <p className="text-sm font-semibold text-accent">The practical reality</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            A laboratory should never be out of reach.
          </h2>
          <p className="mt-4 text-lg text-on-surface-variant">
            In many West African secondary schools, science practicals are taught on the blackboard because reagents, glassware, water, or power are missing. Expera changes that.
          </p>
        </div>

        <div className="reality-stack">
          {BLOCKS.map((block, index) => (
            <article
              key={block.kicker}
              className="reality-stack-card mb-4 lg:mb-6"
              style={{ ["--stack-index" as string]: index }}
            >
              <div className="grid min-h-[32rem] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] lg:grid-cols-2">
                <div className={`flex flex-col justify-center gap-4 px-7 py-10 sm:px-10 lg:px-12 ${block.panel}`}>
                  <p className={`text-sm font-semibold ${block.leadTone}`}>{block.kicker}</p>
                  <h3 className="max-w-[18ch] font-display text-3xl font-bold leading-[1.15] tracking-tight text-brand sm:text-[2.15rem]">
                    {block.title}
                  </h3>
                  <p className={`max-w-[36ch] text-base font-semibold leading-snug ${block.leadTone}`}>{block.lead}</p>
                  <p className="max-w-[42ch] text-base leading-relaxed text-on-surface/80">{block.body}</p>
                </div>
                <div className="relative min-h-[18rem]">
                  <img src={block.image.src} alt={block.image.alt} className="absolute inset-0 h-full w-full object-cover" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
