import { HeroSection } from "./HeroSection";
import { LandingNav } from "./LandingNav";
import {
  BenefitsSection,
  CurriculumSection,
  EarlyAccessSection,
  ExperienceSection,
  FAQSection,
  FinalCTASection,
  LabSection,
  LandingFooter,
  ParentsSection,
  ProfessionalsSection,
  SchoolsSection,
  StagesSection,
  SubjectsSection,
} from "./LandingSections";

export function LandingPage() {
  return (
    <div className="overflow-x-clip">
      <LandingNav />
      <HeroSection />
      <ExperienceSection />
      <LabSection />
      <SubjectsSection />
      <StagesSection />
      <BenefitsSection />
      <CurriculumSection />
      <SchoolsSection />
      <ParentsSection />
      <ProfessionalsSection />
      <EarlyAccessSection />
      <FAQSection />
      <FinalCTASection />
      <LandingFooter />
    </div>
  );
}
