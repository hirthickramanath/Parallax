# Independent review handoff and evidence contract

No independent reviewer is claimed by this implementation. `content/review/evidence.json` is deliberately empty. AI-assisted partial source inspection is in a separate file and cannot upgrade a lesson.

For an actual review, identify the lesson, authors and independent reviewer. The reviewer should read the full lesson and its assumptions, solve every question without relying on its answer, inspect all diagrams/models and check the exact sources. Record corrections and unresolved issues. Review only becomes eligible for approval after unresolved scientific issues are addressed and the reviewer accepts the final version.

A verified/published lesson must satisfy the existing frontmatter checks and reference a unique evidence record through `verification.evidenceId`. The record requires:

- `id`, `lessonId`, `reviewer`, `reviewedAt` matching lesson metadata, `authorIds` excluding the reviewer, `independent: true`, `decision: "approved"` and `unresolvedIssues: []`.
- `sectionIds` covering every authored section and `questionIds` covering every question.
- `sources` with exact `title`, `edition`, `locator`, `inspectedBy`, `inspectedAt` and claim-specific `notes`. Use a traceable repository snapshot for online source editions; do not invent printed editions or pages.
- `sha256` matching the full final MDX file, including finalized frontmatter. After metadata and corrections are finalized, calculate this with `sha256sum content/lessons/ID.mdx`. Any later change invalidates the record and needs renewed review. This fingerprint covers MDX, not the code of embedded widgets. Model implementation changes require renewed scientific/model review and separate version notes; this check does not automatically detect them. This metadata check does not authenticate people or establish that statements in an entered record are true.

Do not add fictitious names, dates or source inspections merely to make the build pass. Drafts remain playable without independent evidence. Partial source inspections are current only for their recorded lesson fingerprint and list their limited scope; they are not a substitute for the independent review record.

Human work still required: willing subject reviewers, actual reading/source inspection for remaining claims, scientific corrections, explicit acceptance of final versions and appropriate attribution. This cannot be replaced by a passing numerical test or generated ledger.
