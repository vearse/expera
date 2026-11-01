# Element data source

- **Dataset**: PubChem Periodic Table of Elements, National Library of Medicine (NIH).
- **URL**: https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON
- **Licence**: Public domain (US Government work). See https://www.ncbi.nlm.nih.gov/home/about/policies/
- **Raw copy**: `scripts/data/pubchem-periodictable.json`. Regenerate with `npm run import:elements`.

## Fields and where they come from

| Field | Source |
|---|---|
| atomicNumber, symbol, name, atomicMassIupac, electronConfiguration, stateAtRTP, category | PubChem |
| group, period, block | Derived from atomic number (La and Ac in group 3; Ce–Lu and Th–Lr have no group) |
| shells (e.g. 2,8,1) | Derived from PubChem electron configuration |
| type (metal / non-metal / metalloid) | Derived from PubChem GroupBlock |
| atomicMassExam | `content/chemistry/conventions.yaml` (WAEC rounded values) |
| uses, nigerianExamples | Curated in `scripts/data/element-notes.yaml` |

## NEEDS TEACHER REVIEW

- `uses` and `nigerianExamples` for every element.
- `atomicMassExam` values against the current WAEC/NECO data sheet.
- Shell arrangements beyond calcium (Z = 20): the SS syllabus usually draws shells only up to Z = 20.
