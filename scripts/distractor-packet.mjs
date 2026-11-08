// Packet for an independent distractor writer, and a comparison of what they wrote with the shipped options.
//   node scripts/distractor-packet.mjs export OUT.csv [LESSON_ID ...]   (default: every 12th lesson)
//   node scripts/distractor-packet.mjs compare RESPONSES.csv
// The packet holds prompts and correct answers only. It never contains the existing wrong options, so the writer
// cannot copy them. This is a measuring tool; it does not change any lesson.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const HEADER = [
  "lessonId",
  "questionId",
  "prompt",
  "correctAnswer",
  "distractor1",
  "distractor2",
  "distractor3",
  "flag",
];

export function loadConceptual(dir = "content/lessons") {
  const out = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".mdx")).sort()) {
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    const meta = JSON.parse(text.slice(4).split("\n---\n", 1)[0]);
    for (const q of meta.questions || [])
      if (q.conceptual && q.options?.length)
        out.push({ lessonId: meta.id, ...q });
  }
  return out;
}

export function toCsv(rows) {
  const cell = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  return rows.map((r) => r.map(cell).join(",")).join("\n") + "\n";
}

export function parseCsv(text) {
  const rows = [];
  let row = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (cell += '"'), i++;
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") (row.push(cell), (cell = ""));
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell || row.length) (row.push(cell), rows.push(row));
  return rows;
}

export function sample(questions, ids) {
  if (ids?.length) return questions.filter((q) => ids.includes(q.lessonId));
  const lessons = [...new Set(questions.map((q) => q.lessonId))];
  const keep = new Set(lessons.filter((_, i) => i % 12 === 0));
  return questions.filter((q) => keep.has(q.lessonId));
}

export function exportPacket(questions) {
  return toCsv([
    HEADER,
    ...questions.map((q) => [q.lessonId, q.id, q.prompt, q.answer, "", "", "", ""]),
  ]);
}

const words = (s) =>
  new Set(s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 2));
export function jaccard(a, b) {
  const x = words(a),
    y = words(b);
  if (!x.size || !y.size) return 0;
  let n = 0;
  for (const w of x) if (y.has(w)) n++;
  return n / (x.size + y.size - n);
}
// 0 = key is the longest option.
export function keyRank(key, options) {
  return [...options].sort((a, b) => b.length - a.length).indexOf(key);
}

export function compare(responses, existing) {
  const byKey = new Map(existing.map((q) => [`${q.lessonId}/${q.id}`, q]));
  const rank = (n) => Array.from({ length: n }, () => 0);
  const humanRanks = rank(4),
    shippedRanks = rank(4);
  let used = 0,
    sim = 0,
    simN = 0,
    flagged = [];
  for (const r of responses) {
    const q = byKey.get(`${r.lessonId}/${r.questionId}`);
    const ds = [r.distractor1, r.distractor2, r.distractor3].map((s) => s?.trim());
    if (!q || ds.some((d) => !d)) continue;
    if (q.options.length !== 4) continue;
    used++;
    humanRanks[keyRank(q.answer, [q.answer, ...ds])]++;
    shippedRanks[keyRank(q.answer, q.options)]++;
    const wrong = q.options.filter((o) => o !== q.answer);
    for (const d of ds) {
      sim += Math.max(...wrong.map((w) => jaccard(d, w)));
      simN++;
    }
    if (r.flag?.trim()) flagged.push(`${r.lessonId}/${r.questionId}: ${r.flag.trim()}`);
  }
  const pct = (a) => a.map((n) => (used ? +(n / used).toFixed(3) : 0));
  return {
    questionsCompared: used,
    keyLengthRank_human: pct(humanRanks),
    keyLengthRank_shipped: pct(shippedRanks),
    meanBestWordOverlapWithShippedDistractors: simN ? +(sim / simN).toFixed(3) : 0,
    flagged,
    note: "Rank 0 = key is the longest option. Overlap is a word-level Jaccard; a low value means the writer found different wrong answers.",
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, file, ...ids] = process.argv.slice(2);
  if (cmd === "export" && file) {
    const qs = sample(loadConceptual(), ids);
    fs.writeFileSync(file, exportPacket(qs));
    console.log(`Wrote ${qs.length} questions from ${new Set(qs.map((q) => q.lessonId)).size} lessons to ${file}`);
  } else if (cmd === "compare" && file) {
    const [head, ...rows] = parseCsv(fs.readFileSync(file, "utf8"));
    const responses = rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
    console.log(JSON.stringify(compare(responses, loadConceptual()), null, 2));
  } else {
    console.error("Usage: distractor-packet.mjs export OUT.csv [LESSON_ID ...] | compare RESPONSES.csv");
    process.exit(2);
  }
}
