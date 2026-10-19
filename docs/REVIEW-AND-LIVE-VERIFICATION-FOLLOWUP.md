# Scientific review, learner pilot and service verification follow-up

## Completed

- Inspected thirteen additional chemistry/organic source passages and six complex-analysis sections at pinned commits. Current coverage is 181 partial lesson mappings. These are scoped AI-assisted inspections, not full lesson verification or independent approvals. 173 lessons have no current partial mapping; every lesson still needs broader scientific review.
- Added `npm run review:handoff -- NEW_DIRECTORY [LESSON_ID ...]`. This exports actual lesson/model sources, dependency metadata, source-scoped packets, unfilled review worksheets and a SHA-256 manifest. Existing destinations are never overwritten. The full export contains all 354 lessons and 1130 files; integrity matched. No private pilot records, environment files or credentials are included.
- Added `npm run verify:public -- https://parallax-science.pages.dev`. It compares entry assets, actual JS/CSS bytes and four representative lesson JSON files against the local production build. It rejects stale content, missing/corrupt assets and HTTP-200 HTML fallbacks. It does not authenticate to Firebase or establish optional-service activation. Run a fresh local build first.
- Verified that checker through real HTTP requests to a locally served production build. This proves the local check workflow, not production availability.
- Production build and all 645 unit/content/model/evidence tests passed. Tutor, assessment and reminder type checks passed; their eight separate service tests passed. All three Worker dry-run bundles passed after fixing local configuration paths. No Worker was deployed or enabled.

## External access remains required

The running environment still lacks production-site access and cloud credentials. The saved configuration draft now preserves the prior `api.cloudflare.com` and `storage.googleapis.com` rules and adds:

- `parallax-science.pages.dev`
- `identitytoolkit.googleapis.com`
- `securetoken.googleapis.com`
- `firestore.googleapis.com`
- `parallax-73.firebaseapp.com`

The environment tool confirmed the draft was saved with `requires_publish: true`. Review/save and publish the environment settings to apply these domains. The existing Cloudflare token/account-ID requirements remain unfilled; credentials must be entered securely in environment settings, not chat. Public-site checking needs network access; inspecting account deployment status additionally needs scoped Cloudflare access. Actual Firebase sign-in, cross-device sync and owner/cross-account rules still require real account sessions and deployed checks. Firestore emulator validation remains unrun until its artifact is available; no pass is inferred from the source rules.

The [setup skill](skill://plugin_connector_1p_ed5feb9070a08191b08c81c47947bc16/setup/SKILL.md) states: “Saving persists configuration; it does not execute scripts, apply runtime changes, or publish.” That boundary is why a saved draft alone cannot complete live verification.

Wrangler startup instructions were also saved: create `/tmp/parallax-wrangler-config` and `/tmp/parallax-wrangler-logs`; set `XDG_CONFIG_HOME` and `WRANGLER_LOG_PATH` to those writable locations for local checks. This fixed the inaccessible default `/home/agent/.config/.wrangler` path without changing HOME or bypassing sandbox restrictions.

## Learner pilot

A volunteer has begun qualitative intake. Private responses remain outside the repository and review bundle. No numerical baseline or immediate answers were supplied; reasoning was not scored. The volunteer reported understanding the chat explanation and confirmed chat-only study. This is genuine qualitative feedback, but it does not establish app use, learning gain, retention or a completed learner trial.

An app-based immediate trial, recorded answers/assistance and a delayed follow-up about a week after instruction remain open. Do not manufacture scores or label the chat interaction a full course evaluation. The existing [pilot protocol](FOUNDATION-LEARNER-PILOT.md) and scorer remain available.

## Independent review

Qualified independent reviewer decisions have not been provided. Every lesson remains draft and the approval ledger remains empty. Share the exported bundle with a reviewer; ask them to return a working copy of the review worksheets separately, retaining the original manifest and source snapshot. Check returned evidence against the repository gate before changing publication status. The authoring agent cannot approve its own work independently.
