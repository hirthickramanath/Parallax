import test from "node:test";
import assert from "node:assert/strict";
import {
  exportPacket,
  parseCsv,
  toCsv,
  compare,
  keyRank,
  sample,
  loadConceptual,
} from "./distractor-packet.mjs";

const q = (lessonId, id, answer, options) => ({
  lessonId,
  id,
  prompt: 'Why, "exactly"?',
  answer,
  options,
});

test("the packet never contains the shipped wrong options", () => {
  const qs = [q("A1", "c1", "right answer", ["wrong one", "right answer", "wrong two", "wrong three"])];
  const csv = exportPacket(qs);
  for (const w of ["wrong one", "wrong two", "wrong three"]) assert.ok(!csv.includes(w));
  assert.ok(csv.includes("right answer"));
});

test("CSV round-trips commas, quotes and newlines", () => {
  const rows = [["a", 'he said "hi", then\nleft', ""], ["b", "c", "d"]];
  assert.deepEqual(parseCsv(toCsv(rows)), rows.map((r) => r));
});

test("keyRank is 0 for the longest option", () => {
  assert.equal(keyRank("aaaa", ["aaaa", "bb", "c", "dd"]), 0);
  assert.equal(keyRank("bb", ["aaaa", "bb", "c", "d"]), 1);
});

test("compare ignores incomplete rows and reports rank and overlap", () => {
  const existing = [q("A1", "c1", "right answer here", ["right answer here", "foo bar baz", "qux quux corge", "grault garply"])];
  const out = compare(
    [
      { lessonId: "A1", questionId: "c1", distractor1: "foo bar baz", distractor2: "x y z", distractor3: "a b c", flag: "d2 may also be true" },
      { lessonId: "A1", questionId: "c1", distractor1: "", distractor2: "", distractor3: "" },
    ],
    existing,
  );
  assert.equal(out.questionsCompared, 1);
  assert.equal(out.flagged.length, 1);
  assert.ok(out.meanBestWordOverlapWithShippedDistractors > 0);
});

test("the default sample is deterministic and covers whole lessons", () => {
  const all = loadConceptual();
  const a = sample(all),
    b = sample(all);
  assert.deepEqual(a.map((x) => x.id), b.map((x) => x.id));
  assert.ok(a.length > 50);
  const ids = new Set(a.map((x) => x.lessonId));
  for (const l of ids)
    assert.equal(a.filter((x) => x.lessonId === l).length, all.filter((x) => x.lessonId === l).length);
});
