# Companion learning site: excluded subjects and AI build brief

## Execution boundary

This is a future, separate website brief. Writing this file does not authorize building it inside Parallax. When the owner starts that project, use its own repository, Firebase project, deployment, rules, and content namespace. Never copy credentials or assume Parallax sign-in sessions cross sites. Do not alter Parallax's core astrophysics/maths/physics curriculum.

The proposed working name is “Fieldnotes”; the owner can choose another name. No domain availability is claimed.

## Subjects excluded from Parallax as full tracks

| Subject | Dedicated scope here | Material that may remain in Parallax |
| --- | --- | --- |
| Biology | Cell/molecular biology, genetics, evolution, physiology, ecology, biological research | Habitability, biosignatures, origins-of-life prerequisites |
| Psychology | Cognition, perception, learning, motivation, social behaviour, research methods | Learning techniques and brief misconception/context notes |
| Earth Science (new) | Geology, geophysics, atmosphere, oceans, climate, Earth systems | Planetary interiors, mineral/atmosphere context needed for astronomy |
| Neuroscience (new) | Cellular, systems, cognitive, computational neuroscience | A focused prerequisite explanation only when required |
| Philosophy of Science (new) | Evidence, explanation, models, causality, scientific change, ethics | Short scientific-method and uncertainty notes |
| General computing | Research coding/data skills in service of the subjects above | Astronomy and numerical methods stay in Parallax; full technology careers belong in the separate engineering plan |

No new physics or mathematics degree track is required here. Supply short bridge modules or links to prerequisites; do not assume cross-site progress exists.

## Learner and teaching contract

Target a learner strong in school mathematics/physics but new to biology, psychology, and philosophy. Start with the necessary biological vocabulary without reducing the final level of rigour. Progress from foundations through undergraduate methods to guided reading and reproducible research tasks.

Every stored lesson follows question → prediction → evidence/story → intuition → formal model → interactive → conceptual check → limitations → connection. Distinguish established results, competing explanations, and uncertainty. No live-generated core lessons, copied textbook prose, or invented historical claims. AI tutoring is optional and grounded in published course content.

## Proposed curriculum and outcomes

These are unit proposals, not a verified lesson count. Assign exact lesson counts after a content inventory.

### Shared research foundations

- S1 Evidence and measurement: operational definitions, uncertainty, effect sizes, confounding, reliability, validity, units.
- S2 Statistics for empirical science: probability, sampling, estimation, intervals, tests, Bayes, regression, multiple comparisons.
- S3 Reproducible research: Python notebooks, data provenance, version control, ethics, preregistration, replication.
- S4 Mathematical models: rates of change, exponential processes, simple ODEs, linear algebra refreshers.

Outcome: critique an empirical claim, reproduce a basic analysis, and explain uncertainty without treating a p-value as the chance a claim is true.

### Biology

- B1 Cells and biomolecules: membranes, proteins, nucleic acids, energy and metabolism.
- B2 Genetics and molecular information: inheritance, gene expression, regulation, population genetics.
- B3 Evolution and diversity: selection, drift, phylogenetics, adaptation, speciation.
- B4 Physiology and homeostasis: transport, signalling, feedback, organismal systems.
- B5 Ecology and systems: populations, communities, ecosystems, conservation, biogeochemical cycles.
- B6 Quantitative biology: diffusion, enzyme kinetics, sequence analysis, evolutionary models, guided literature reading.

Outcome: connect molecular mechanisms to organisms and ecosystems, and analyse a public biological dataset.

### Psychology

- P1 Research design and replication: experiments, observational studies, measurement, reproducibility, ethics.
- P2 Perception and attention: psychophysics, sensory inference, attentional limits.
- P3 Learning and memory: conditioning, retrieval, spacing, working memory, forgetting.
- P4 Cognition and decision-making: heuristics, reasoning, bounded rationality, uncertainty.
- P5 Motivation and social behaviour: emotion, habits, individual/context effects, social inference.
- P6 Learning science and research: intervention evidence, individual differences, replication analysis, critical reading.

Outcome: evaluate behavioural findings and design a small, ethical non-clinical study. Do not present the site as a diagnostic or therapy service.

### Earth Science

- E1 Deep time and Earth materials: minerals, rocks, dating methods, stratigraphy.
- E2 Plate tectonics and the interior: seismology, deformation, heat flow, mantle/crust interaction.
- E3 Surface processes: weathering, erosion, rivers, glaciers, soils, geomorphology.
- E4 Atmosphere and oceans: circulation, energy balance, water cycle, ocean dynamics.
- E5 Climate and biogeochemistry: carbon cycle, paleoclimate, forcing/feedback, models and uncertainty.
- E6 Observation and hazards: remote sensing, GIS foundations, earthquakes, volcanism, risk communication.
- E7 Research capstone: reproduce a published trend with a documented public dataset and uncertainty analysis.

Outcome: explain coupled Earth systems and distinguish a model projection from a deterministic prediction. Link to astronomy's planetary comparisons without making Earth science an astronomy-only course.

### Neuroscience

- N1 Cells and electrical signalling: neurons, glia, membranes, action potentials, synapses.
- N2 Circuits and systems: coding, sensory/motor circuits, plasticity, networks.
- N3 Cognitive neuroscience: attention, memory, language, decision-making; strengths and limits of lesion/imaging evidence.
- N4 Methods: electrophysiology, EEG, imaging, experimental design, inverse problems, causal interventions.
- N5 Computational neuroscience: integrate-and-fire models, population coding, basic inference and learning models.
- N6 Research reading: reproduce a small published model using synthetic or clearly licensed public data.

Outcome: connect cellular mechanisms to systems while resisting unsupported reverse inference from brain activity to mental state. No medical advice or diagnostic claims.

### Philosophy of Science

- F1 Arguments and evidence: validity, induction, deduction, abduction, underdetermination.
- F2 Scientific explanation: laws, mechanisms, models, idealization, reduction and emergence.
- F3 Confirmation and falsification: Bayesian confirmation, severe testing, demarcation, limits of simple slogans.
- F4 Causation and experimentation: interventions, counterfactuals, causal graphs, confounding.
- F5 Scientific change: paradigms, research programmes, realism/instrumentalism, historical case studies.
- F6 Values and responsibility: objectivity, bias, research ethics, incentives, open science.
- F7 Capstone: defend and critique interpretations of a real scientific dispute using primary evidence.

Outcome: construct and evaluate arguments about science. Represent philosophical disagreements fairly, with attributed positions rather than marking one contested position as settled fact.

## Dependency order

Use a unit DAG (directed acyclic graph: prerequisites cannot loop). A proposed starting order:

1. Research foundations S1 and biological foundations B1; F1 can begin independently.
2. S2 after S1; S3 after basic computing bridge; S4 after mathematical bridge. B2/B3 after B1. P1 after S1; E1 after S1.
3. P2/P3 after P1; N1 after B1 and electricity/chemistry bridge; E2/E3 after E1 and mechanics bridge; F2/F3 after F1 and S1.
4. B4 after B1/B2; B5 after B3 and S2. E4 after S4 and thermodynamics/fluid bridge. N2 after N1; P4 after P2/P3 and S2.
5. N3 after N2 and P2/P3; N4 after N1 and S2/S3; E5 after E4/B5; E6 after E2/E3/S3; F4 after S2/F1.
6. N5 after N2/S4/S3; P5 after P1/P4; quantitative B6 after B2/B3/S3/S4. F5/F6 after introductory philosophy/research work.
7. Research capstones after each subject's methods and content prerequisites.

Resolve bridges explicitly before generating a final manifest. Do not create hard dependencies on an external Parallax account or assume astronomy mastery.

## Proposed technical stack

- React + TypeScript + Vite, Tailwind/shadcn, React Router; editorial responsive interface.
- Static MDX with frontmatter, KaTeX, original diagrams, accessible interactive plots.
- Firebase Auth + Firestore Spark behind DataStore; offline local-first progress.
- Cloudflare Pages for hosting; optional Cloudflare Worker for tutoring with an eligible free provider.
- ts-fsrs for review once foundational content works.
- Static local search for concepts; no paid hosted search or vector database for the first release.
- Separate projects/credentials from Parallax. Do not set up single sign-on or shared databases without an explicit later decision.

Confirm current free-tier quotas and age/regional terms before setup. No credit card. Gracefully disable optional tutoring if the service cannot be used.

## AI execution stages and acceptance

1. **Inspect and plan:** verify sources, licences, content inventory, prerequisite graph, and service eligibility. Return an explicit proposed manifest, not invented lesson totals.
2. **Foundation:** scaffold in the separate repository, theme, auth, responsive dashboard. Build and typecheck pass; sign-in verified separately from mocks.
3. **Content pipeline:** validate IDs, schemas, prerequisites, references, accessibility metadata, and draft/verified/published state.
4. **One vertical slice:** S1 lesson on “Does a larger sample remove bias?” Include a prediction, an original sampling simulation, conceptual checks, saved attempts, recap and resume. Verify sampling examples numerically.
5. **Security and sync:** owner-only rules, local-first writes, offline recovery, cross-account tests, safe imported content. No sensitive participant or clinical data collection.
6. **Review:** stored cards, FSRS, weak-concept retrieval and recaps; verify due dates and timezone boundaries.
7. **Optional tutor:** authenticated grounded answers, quotas, timeouts, safe Markdown, explicit uncertainty and source links. No generated clinical advice.
8. **Curriculum rollout:** foundations → biology/psychology/Earth introductory content → neuroscience → deeper philosophy/methods → capstones, following the approved graph.

For every stage, report changed files, executed checks, limitations, exact owner dashboard steps, and a reviewable Git branch. Do not merge or publish other sites implicitly. Finish one useful slice before producing a large unverified lesson collection.

## Sources and verification

Choose editions/licences before using sources. Candidate references include OpenStax Biology/Psychology and openly licensed Earth science material; Alberts for cell biology; Kandel/Dayan & Abbott for neuroscience; a balanced introductory philosophy-of-science text plus primary historical sources. Cite and paraphrase responsibly, verify empirical claims against current reviews, and link public datasets with licences and retrieval dates. Do not copy copyrighted prose or assume every textbook figure can be reused.
