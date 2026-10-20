# Simulation controls, revision tutoring and background notifications

## Simulation changes

Every range control in the widget library now uses the shared `SimulationSlider`, covering both the connected apparatus components and the common investigation control used across the course. Native mouse, touch and keyboard behavior is retained, with a full-width 44 px control area. Each control also has an expandable **Type a value** alternative; **Apply value** validates finite input, clamps to bounds and snaps to the same step grid as the native range. Empty/invalid input does not alter the model. Fractional step grids are based on the minimum, including a maximum that does not lie on the grid.

Readouts now preserve precision for tiny physical quantities instead of rounding distinct settings to the same displayed zero. Generic investigation points have larger hit targets and keyboard movement; discrete models use one model step for horizontal keyboard movement. Changing a control continues to drive its original equations; mathematical model formulas are unchanged.

Physical browser tests drag the actual native thumb with both a mouse and Chromium touch input across 17 representative lesson scenes, covering foundational and connected apparatus controls. Direct number entry, clamping and keyboard adjustment are also exercised. These checks do not establish that every mobile OS behaves identically; report a chapter/control if device-specific behavior remains.

## AI tutor

The tutor is available from ordinary lesson controls and the revision player's **Ask AI tutor** button. In revision, the server receives the validated current step and fetches the actual guide alongside the trusted lesson. The prompt starts from definitions and assumes uneven recall, asks one diagnostic question at a time and offers hints before full solutions. Conversation persistence, account separation, streamed Markdown/KaTeX, cancellation, error handling and daily quotas remain in place. No tutor response changes course mastery or supplies independent scientific approval.

The Worker supports two adapters:

- **Cloudflare Workers AI:** uses the deployed AI binding and configured `AI_MODEL`.
- **Gemini:** uses a server-only `GEMINI_API_KEY` header and configured `GEMINI_MODEL`. Provider URLs are fixed to the official Gemini host; the model identifier is validated. The adapter normalizes visible answer text and omits provider thought-marked parts. API keys never appear in the browser configuration, request query string or public stream.

A local Worker integration test signs a test Firebase identity token, supplies a mocked JWKS/lesson/provider transport, verifies revision grounding and streaming, and checks that the next request is refused by the server quota. It is not evidence of live provider availability or a real production sign-in.

## Background notifications

Settings provides explicit per-browser opt-in, permission-denial feedback, detection of a missing/revoked local subscription, disable/unsubscribe, and a **Send a test notification** button. Permission is never requested simply by opening Settings. Setup waits for an active service worker with a bounded timeout. iPhone/iPad users receive Home Screen guidance.

The reminder Worker retains encrypted standards-based Web Push, authenticated account ownership, the existing scheduled local-time delivery, goal suppression, endpoint validation, bounded retries, expired-subscription handling and the bounded pilot capacity. The test endpoint sends only to the authenticated account's specified registered browser and permits one test per minute per device. A successful push-service response means accepted for delivery, not a guarantee that the OS displayed it. Browser permission and a real closed-tab delivery test remain user-device steps.

Notification signing keys were prepared outside the repository with a private file mode of 0600. No keys or real subscriptions are committed. VAPID does not require buying a third-party notification API service.

## Public configuration and activation

`public/services.json` contains only public deployment URLs and the VAPID public key:

```json
{"tutorUrl":"","pushUrl":"","pushPublicKey":""}
```

The file is loaded with `no-store`. Existing `VITE_TUTOR_URL`, `VITE_PUSH_URL` and `VITE_PUSH_PUBLIC_KEY` overrides still take precedence. Empty configuration leaves services disconnected and lessons usable. HTTPS or same-origin endpoints are required. A Gemini key, VAPID private key or Cloudflare token must never go here or into a `VITE_` variable.

Before activation:

1. Provide deployment access for the intended Cloudflare account. The current credential can list Workers, but a real staged Wrangler deployment was denied at the Worker secrets endpoint; the account subdomain endpoint also returned authentication error 10000. No staged Worker was created. Update the existing secure Cloudflare token binding rather than adding a duplicate. The deployment needs **Workers Scripts: Edit**, with **Account Settings: Read** for account/subdomain discovery; retain the Pages access already used to inspect production.
2. Choose an eligible tutor provider/project and a currently available model. For Gemini, put `GEMINI_API_KEY` in the tutor Worker's secure secret store; select `TUTOR_PROVIDER=gemini` and set `GEMINI_MODEL`. For Workers AI, retain the AI binding, choose `TUTOR_PROVIDER=workers-ai` and confirm the intended model/account access. Do not upgrade billing automatically or use an account to bypass provider eligibility.
3. Configure the reminder Worker's private signing key through its secure secret store, its matching public key, and an owner contact URI (`VAPID_SUBJECT`, normally a contact email with `mailto:` or the owned project’s HTTPS URI). Keep the private key out of Git, browser variables and chat. The prepared key pair can be uploaded once deployment access works; no external push API key is needed.
4. Deploy the verified Workers with their relevant enable flag set only after configuration is ready. Configure their real public origins and matching public key in the public service configuration (or existing Pages variables), then deploy the frontend.
5. Check real Firebase-authenticated requests, provider response/quota behavior and actual browser push registration, closed-tab delivery, timezone and unsubscribe. Local mocks do not substitute for those checks.

The app changes can be deployed while both services remain disconnected. Independent scientific review, complete source verification and real learner/retention evidence remain separate pending work.

## Validation

Required checks are the app build/type check, main content/model/unit suite, tutor and reminder Worker type checks, service unit/integration tests, their dry-run bundles and the full browser regression. Release execution counts are reported with the deployment result. Neither a dry-run bundle nor the local integration fixtures claim a live AI response or a real push delivery.

Executed checks for this release:

- Production app build and TypeScript checks: passed.
- Main content/model/unit suite: 658 passed.
- Tutor Worker integration tests: 2 passed, including verified test identity, trusted revision grounding and quota enforcement.
- Reminder service tests: 3 passed, including encrypted mock delivery, device/account ownership and test-send cooldown.
- Tutor/reminder Worker type checks and dry-run deployment bundles: passed.
- The first browser sweep exposed five selectors that matched both the native range and its newly added number editor, plus one probe test measuring coordinates before automatic scrolling. Selectors now identify the intended slider exactly; the probe test measures after scrolling. All six retained their scientific assertions and passed their targeted rerun.
- Final complete browser rerun: 119 passed with two isolated browser workers; no remaining failures.
