import fs from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  requireReviewEvidence,
  sourceFingerprint,
  currentSourceInspection,
} from "./review-evidence.mjs";
function fixture() {
  const source = "Synthetic unit-test source, not an actual review";
  const data = {
    id: "TEST",
    status: "verified",
    verification: {
      evidenceId: "synthetic",
      reviewedAt: "2026-01-02",
      reviewer: "test-reviewer",
    },
    questions: [{ id: "q1" }],
  };
  const sections = [{ id: "theory" }];
  const ledger = {
    reviews: [
      {
        id: "synthetic",
        lessonId: "TEST",
        sha256: sourceFingerprint(source),
        decision: "approved",
        independent: true,
        reviewer: "test-reviewer",
        authorIds: ["test-author"],
        reviewedAt: "2026-01-02",
        sectionIds: ["theory"],
        questionIds: ["q1"],
        sources: [
          {
            title: "Synthetic fixture only",
            edition: "test edition",
            locator: "test section",
            inspectedBy: "test-reviewer",
            inspectedAt: "2026-01-01",
            notes: "Unit-test evidence; no real inspection claimed.",
          },
        ],
        unresolvedIssues: [],
      },
    ],
  };
  return { data, source, sections, ledger };
}
function run(f) {
  return requireReviewEvidence(f.data, f.source, f.sections, f.ledger);
}
test("publication requires complete fresh independent evidence metadata", () => {
  run(fixture());
  const f = fixture();
  f.ledger.reviews = [];
  assert.throws(() => run(f), /review evidence/);
});
test("editing source invalidates previous evidence fingerprint", () => {
  const f = fixture();
  f.source += " changed";
  assert.throws(() => run(f), /Stale/);
});
test("self-review source placeholders incomplete coverage and unresolved issues are rejected", () => {
  for (const mutate of [
    (f) => f.ledger.reviews[0].authorIds.push("test-reviewer"),
    (f) => (f.ledger.reviews[0].sources[0].locator = "pending"),
    (f) => (f.ledger.reviews[0].questionIds = []),
    (f) => (f.ledger.reviews[0].unresolvedIssues = ["incorrect sign"]),
  ]) {
    const f = fixture();
    mutate(f);
    assert.throws(() => run(f));
  }
});
test("drafts remain playable without fabricated evidence or verification upgrades", () => {
  const f = fixture();
  f.data.status = "draft";
  f.ledger.reviews = [];
  run(f);
});

test("partial source inspections expire when lesson text changes and never imply independent verification", () => {
  const ledger = {
    inspections: [
      {
        lessonId: "TEST",
        lessonSha256: sourceFingerprint("current"),
        independent: false,
        sources: [{ locator: "module" }],
      },
    ],
  };
  assert.equal(currentSourceInspection("TEST", "current", ledger).length, 1);
  assert.equal(currentSourceInspection("TEST", "changed", ledger).length, 0);
  ledger.inspections[0].independent = true;
  assert.equal(currentSourceInspection("TEST", "current", ledger).length, 0);
});

test("actual partial source ledger matches current drafts and immutable official source locators", () => {
  const ledger = JSON.parse(
    fs.readFileSync("content/review/source-inspections.json", "utf8"),
  );
  assert.equal(ledger.inspections.length, 29);
  for (const r of ledger.inspections) {
    const source = fs.readFileSync(`content/lessons/${r.lessonId}.mdx`, "utf8");
    assert.equal(r.lessonSha256, sourceFingerprint(source));
    assert.equal(r.independent, false);
    const official = [
      "https://github.com/openstax/osbooks-university-physics-bundle",
      "https://github.com/openstax/osbooks-calculus-bundle",
      "https://github.com/openstax/osbooks-chemistry-bundle",
      "https://github.com/jirilebl/ra",
    ];
    assert.ok(
      r.sources.every((s) =>
        official.includes(s.repository || ledger.repository),
      ),
    );
    assert.ok(
      r.sources.every(
        (s) =>
          s.url ===
          `${s.repository || ledger.repository}/blob/${s.commit || ledger.commit}/${s.locator}`,
      ),
    );
    assert.ok(source.includes('"status": "draft"'));
  }
});
