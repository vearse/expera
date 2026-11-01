import { loadCompounds, loadConventions, loadElements, loadReagents } from "@/lib/content/load";
import { AtomBuilder } from "@/components/learn/AtomBuilder";
import { CompoundBench } from "@/components/learn/CompoundBench";
import { MoleculeViewer } from "@/components/learn/MoleculeViewer";
import { PeriodicTable } from "@/components/learn/PeriodicTable";
import { MatchGroupGame } from "@/components/learn/MatchGroupGame";
import { PHExplorer } from "@/components/learn/PHExplorer";
import { LearnShell } from "@/components/learn/LearnShell";

export function ChemistryLearnRun({ moduleId }: { moduleId: string }) {
  switch (moduleId) {
    case "periodic-table": {
      const { elements, source } = loadElements();
      return (
        <LearnShell title="Periodic Table explorer" learnId="periodic-table" exploredTotal={4} topicBack>
          <p className="text-sm text-slate-600">Filter by state, explore trends, compare two elements, and switch 2D/3D in the detail panel.</p>
          <PeriodicTable elements={elements} source={source} />
          <MatchGroupGame elements={elements} />
        </LearnShell>
      );
    }
    case "atom-builder": {
      const elements = loadElements().elements.filter((e) => e.atomicNumber <= 20);
      return (
        <LearnShell title="Atom builder" learnId="atom-builder" practiceHref="/chemistry/practice/qualitative-analysis" topicBack>
          <AtomBuilder elements={elements} isotopes={loadCompounds().isotopes} />
        </LearnShell>
      );
    }
    case "compound-bench": {
      const c = loadCompounds();
      return (
        <LearnShell title="Compound builder" learnId="compound-bench" practiceHref="/chemistry/practice/acids-bases-salts" topicBack>
          <CompoundBench cations={c.cations} anions={c.anions} molecules={c.molecules} equations={c.equations} masses={loadConventions().examAtomicMasses} />
        </LearnShell>
      );
    }
    case "ph-explorer": {
      const { substances, indicators } = loadReagents();
      return (
        <LearnShell title="Acids, bases and the pH scale" learnId="ph-explorer" practiceHref="/chemistry/practice/titration" topicBack>
          <PHExplorer substances={substances} indicators={indicators} />
        </LearnShell>
      );
    }
    case "molecules":
      return (
        <LearnShell title="Molecules and bonding viewer" learnId="molecules" topicBack>
          <MoleculeViewer molecules={loadCompounds().molecules} />
        </LearnShell>
      );
    default:
      return null;
  }
}
