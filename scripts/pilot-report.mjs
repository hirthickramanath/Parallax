import fs from "node:fs";
import { pathToFileURL } from "node:url";
export const bank = JSON.parse(
  fs.readFileSync(
    new URL("../content/evaluation/foundation-pilot.json", import.meta.url),
    "utf8",
  ),
);
export function pilotReport(records) {
  if (!Array.isArray(records) || !records.length)
    throw Error("Expected nonempty array of voluntary participant records");
  const seen = new Set(),
    groups = { baseline: [], immediate: [], delayed: [] },
    items = Object.fromEntries(
      Object.entries(bank.forms).map(([stage, questions]) => [
        stage,
        Object.fromEntries(
          questions.map((q) => [
            q.id,
            {
              observed: 0,
              answered: 0,
              correct: 0,
              unassistedAnswered: 0,
              unassistedCorrect: 0,
            },
          ]),
        ),
      ]),
    );
  let assisted = 0,
    unscoredReasoning = 0;
  for (const r of records) {
    if (!/^[a-z0-9-]{3,40}$/i.test(r.studyCode || "") || seen.has(r.studyCode))
      throw Error("Use unique pseudonymous study codes");
    seen.add(r.studyCode);
    if (
      !r.priorKnowledge ||
      !["new", "some", "experienced"].includes(r.priorKnowledge)
    )
      throw Error("Record prior knowledge: new, some or experienced");
    const base = Date.parse(r.baseline?.completedAt);
    if (!Number.isFinite(base))
      throw Error("Baseline completion time required");
    for (const stage of Object.keys(groups)) {
      const entry = r[stage];
      if (!entry) continue;
      const time = Date.parse(entry.completedAt);
      if (!Number.isFinite(time) || time < base)
        throw Error("Invalid stage time");
      if (stage === "delayed" && time - base < 6 * 86400000)
        throw Error(
          "Delayed follow-up must be at least six days after baseline",
        );
      if (
        stage === "delayed" &&
        r.immediate &&
        time - Date.parse(r.immediate.completedAt) < 6 * 86400000
      )
        throw Error(
          "Delayed follow-up must be at least six days after immediate instruction",
        );
      if (typeof entry.assisted !== "boolean")
        throw Error("Record assistance explicitly");
      if (entry.assisted) assisted++;
      if (
        !entry.responses ||
        Object.keys(entry.responses).some(
          (k) => !bank.forms[stage].some((q) => q.id === k),
        )
      )
        throw Error("Invalid response IDs");
      let answered = 0,
        correct = 0,
        reasoningPoints = 0,
        reasoningItems = 0;
      for (const q of bank.forms[stage]) {
        const a = entry.responses[q.id];
        const item = items[stage][q.id];
        item.observed++;
        if (!a) {
          unscoredReasoning++;
          continue;
        }
        if (a.value !== null && a.value !== undefined) {
          if (typeof a.value !== "number" || !Number.isFinite(a.value))
            throw Error("Answers must be finite numbers or null");
          answered++;
          item.answered++;
          if (!entry.assisted) item.unassistedAnswered++;
          if (
            Math.abs(a.value - q.answer) <=
            Math.max(1e-6, Math.abs(q.answer) * 0.02)
          ) {
            correct++;
            item.correct++;
            if (!entry.assisted) item.unassistedCorrect++;
          }
        }
        if (a.reasoningScore !== null && a.reasoningScore !== undefined) {
          if (![0, 1, 2].includes(a.reasoningScore))
            throw Error("Human reasoning scores must be 0, 1, 2 or null");
          reasoningItems++;
          reasoningPoints += a.reasoningScore;
        } else unscoredReasoning++;
      }
      groups[stage].push({
        studyCode: r.studyCode,
        answered,
        correct,
        total: bank.forms[stage].length,
        reasoningItems,
        reasoningPoints,
        assisted: entry.assisted,
      });
    }
  }
  const aggregate = (items) => ({
    participants: items.length,
    answered: items.reduce((s, x) => s + x.answered, 0),
    correct: items.reduce((s, x) => s + x.correct, 0),
    possible: items.reduce((s, x) => s + x.total, 0),
    humanScoredReasoningItems: items.reduce((s, x) => s + x.reasoningItems, 0),
    reasoningPoints: items.reduce((s, x) => s + x.reasoningPoints, 0),
  });
  const paired = groups.delayed.map((d) => ({
    d,
    b: groups.baseline.find((b) => b.studyCode === d.studyCode),
  }));
  return {
    scope:
      "Descriptive uncalibrated pilot only; parallel forms differ and no causal learning gain can be inferred. Reasoning scores are human supplied, not independently verified.",
    version: bank.version,
    participants: records.length,
    priorKnowledge: Object.fromEntries(
      ["new", "some", "experienced"].map((k) => [
        k,
        records.filter((r) => r.priorKnowledge === k).length,
      ]),
    ),
    missingImmediate: records.length - groups.immediate.length,
    missingDelayed: records.length - groups.delayed.length,
    assistedStages: assisted,
    unscoredReasoning,
    stages: Object.fromEntries(
      Object.entries(groups).map(([k, v]) => [k, aggregate(v)]),
    ),
    itemEvidence: items,
    unassistedStages: Object.fromEntries(
      Object.entries(groups).map(([k, v]) => [
        k,
        aggregate(v.filter((x) => !x.assisted)),
      ]),
    ),
    matchedBaselineDelayed: {
      participants: paired.length,
      baselineCorrect: paired.reduce((s, x) => s + x.b.correct, 0),
      delayedCorrect: paired.reduce((s, x) => s + x.d.correct, 0),
      unassistedPairs: paired.filter((x) => !x.b.assisted && !x.d.assisted)
        .length,
    },
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [command, arg] = process.argv.slice(2);
  if (command === "handout") {
    if (!bank.forms[arg]) throw Error("Choose baseline, immediate or delayed");
    console.log(
      `# ${arg} — ${bank.version}\n\nRecord the numerical answer, reasoning, assumptions and any assistance. Participation is optional.\n\n` +
        bank.forms[arg].map((q, i) => `${i + 1}. ${q.prompt}`).join("\n\n"),
    );
  } else if (command === "score" && arg)
    console.log(
      JSON.stringify(
        pilotReport(JSON.parse(fs.readFileSync(arg, "utf8"))),
        null,
        2,
      ),
    );
  else
    throw Error(
      "Usage: node scripts/pilot-report.mjs handout baseline|immediate|delayed OR score /private/records.json",
    );
}
