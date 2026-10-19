import { createHash } from "node:crypto";
export const sourceFingerprint = (source) =>
  createHash("sha256").update(source).digest("hex");
function nonempty(x) {
  return (
    typeof x === "string" &&
    x.trim().length > 0 &&
    !/pending|todo|unverified/i.test(x)
  );
}
/** Validates evidence completeness and freshness; it cannot authenticate human identities or truthfulness. */
export function requireReviewEvidence(data, source, sections, ledger) {
  if (!["verified", "published"].includes(data.status)) return;
  const entries = (ledger?.reviews || []).filter(
    (r) => r.id === data.verification?.evidenceId,
  );
  if (entries.length !== 1)
    throw Error(`Missing or ambiguous review evidence ${data.id}`);
  const r = entries[0],
    date = Date.parse(r.reviewedAt);
  if (r.lessonId !== data.id || r.sha256 !== sourceFingerprint(source))
    throw Error(`Stale review evidence ${data.id}`);
  if (
    r.decision !== "approved" ||
    r.independent !== true ||
    !nonempty(r.reviewer) ||
    !Array.isArray(r.authorIds) ||
    !r.authorIds.length ||
    r.authorIds.includes(r.reviewer) ||
    !r.authorIds.every(nonempty)
  )
    throw Error(`Independent review record incomplete ${data.id}`);
  if (
    !Number.isFinite(date) ||
    date > Date.now() ||
    r.reviewedAt !== data.verification.reviewedAt ||
    r.reviewer !== data.verification.reviewer
  )
    throw Error(`Review identity/date mismatch ${data.id}`);
  const requiredSections = sections.map((s) => s.id),
    requiredQuestions = data.questions.map((q) => q.id);
  if (
    !requiredSections.every((id) => r.sectionIds?.includes(id)) ||
    !requiredQuestions.every((id) => r.questionIds?.includes(id))
  )
    throw Error(`Review coverage incomplete ${data.id}`);
  if (
    !Array.isArray(r.sources) ||
    !r.sources.length ||
    !r.sources.every(
      (s) =>
        nonempty(s.title) &&
        nonempty(s.edition) &&
        nonempty(s.locator) &&
        nonempty(s.inspectedBy) &&
        Number.isFinite(Date.parse(s.inspectedAt)) &&
        Date.parse(s.inspectedAt) <= Date.now() &&
        nonempty(s.notes),
    )
  )
    throw Error(`Exact source inspection missing ${data.id}`);
  if (r.unresolvedIssues?.length !== 0)
    throw Error(`Unresolved review issues ${data.id}`);
}

export function currentSourceInspection(lessonId, source, ledger) {
  return (ledger?.inspections || []).filter(
    (r) =>
      r.lessonId === lessonId &&
      r.lessonSha256 === sourceFingerprint(source) &&
      r.independent === false &&
      r.sources?.length > 0,
  );
}
