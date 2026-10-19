# Server assessment and background reminder rollout

Implementation is available; no cloud activation or live delivery is claimed. Both new Workers default to disabled. No payment or billing-card authorization is implied. Confirm the account's current free allocation and quotas before activation.

## Server-owned assessment

`workers/assessment` validates Firebase RS256 identity tokens (issuer, audience, expiry and identity), requires the configured site Origin and chooses a per-account Durable Object using the verified subject. Clients cannot submit a user ID, XP, pass flag or score. The server issues randomized numeric instances, retains its answer specifications, grades once and stores an immutable receipt. Exact resubmission is idempotent; changed submissions are rejected.

The draft bank now supports 11 lessons: PB1.1–PB1.4, MB2.3, AS1.3, PB2.1, PB2.2, MB2.2, MB4.3 and AS1.5. Public capability IDs are shared with the frontend; answer templates stay server-side. New sessions use bank version foundation-2026-10-v2, while issued sessions retain their own stored items/version. It is a server-grading foundation, not a calibrated examination or an independently reviewed certificate. Formulas are learnable and browser clients can be automated; this does not prove unassisted work. Browser Firestore progress remains personal-study data and is not an authoritative ranking source.

Limits: 20 issued sessions per account per UTC day, 20-minute answer window, five questions per session, 100 latest receipts retained. Repeated starts with the same request ID reuse an issued session. A bank version is pinned in each session/receipt. Client UI does not treat a locally edited progress record as a server receipt. Any future leaderboard must consume the server ledger, never client XP. Permanent certification, proctoring and independently validated assessment content are not implemented by this receipt mechanism.

After the code is reviewed and a free-capable account is available:

1. Set `SITE_ORIGIN` and `FIREBASE_PROJECT_ID` in `workers/assessment/wrangler.jsonc` to the intended deployment.
2. Set `ENABLE_ASSESSMENTS=true` only for that deployment and deploy with `npx wrangler deploy --config workers/assessment/wrangler.jsonc` using the owner's authorized account.
3. Set the Pages public variable `VITE_ASSESSMENT_URL` to the real Worker HTTPS origin and redeploy the frontend.
4. With two real accounts, test start/submit/history, cross-account attempt lookup, expired sessions, replay and quota behavior. Confirm that forged local progress never enters server history.

## Background reminders

`workers/reminders` uses standards-based Web Push encryption and VAPID, authenticated subscription management, allowlisted browser push endpoints and a five-minute scheduled trigger. It supports a deliberately bounded pilot of 50 accounts, up to three browsers each and at most 40 delivery attempts per dispatch. Invalid/expired subscriptions are removed on 404/410; transient failures have bounded retries. A dispatch lease prevents overlapping cron deliveries. Updates during network delivery preserve later preference changes and unsubscriptions.

Reminder time is evaluated in the configured timezone, with a 30-minute delivery window, including times crossing midnight. The server suppresses a reminder when it knows that local date's goal was met. That knowledge is best effort: a device that never reconnects cannot report new activity. Delivery is subject to browser, OS and push-service behavior; exact-time delivery is not guaranteed. Late permission acceptance or offline devices do not create a promise to backfill every missed day.

Subscriptions/keys are held only in the server registry, not user-editable Firestore records. The API uses only the verified token subject, rejects arbitrary endpoint hosts and never follows delivery redirects. Payloads contain a generic reminder and a fixed dashboard destination. Client opt-in is explicit. Sign-out attempts server removal and unsubscribes the browser endpoint. Foreground reminders remain available without this service.

Activation requires an authorized account and VAPID configuration:

1. Generate keys locally with `node scripts/create-vapid-keys.mjs /absolute/path/outside/repository/empty-key-directory`. The tool writes protected files and does not print key values.
2. Configure `VAPID_PRIVATE_KEY` through the provider's secure secret mechanism. For an authorized local Wrangler session, `npx wrangler secret put VAPID_PRIVATE_KEY --config workers/reminders/wrangler.jsonc < /secure/path/vapid-private.txt` reads the file without putting its value into a command argument. Do not commit or paste the private key.
3. Set `VAPID_PUBLIC_KEY` and a valid owner contact `VAPID_SUBJECT`, plus `SITE_ORIGIN`, in the reminder deployment configuration. Set `ENABLE_REMINDERS=true` only after verifying free-tier/account suitability.
4. Deploy `workers/reminders/wrangler.jsonc`. Set Pages public variables `VITE_PUSH_URL` and `VITE_PUSH_PUBLIC_KEY` to the deployed HTTPS origin and matching public key, then redeploy Pages.
5. Explicitly enable background reminders in Settings. Check browser support, permission denial, a real closed-tab delivery, timezone scheduling, goal suppression, multiple accounts/devices, unsubscribe and sign-out. Local encrypted-send mocks do not establish real-device delivery.

## Validation commands

- `npm run typecheck:assessment`, `npm run test:assessment`, `npm run assessment:check`.
- `npm run typecheck:reminders`, `npm run test:reminders`, `npm run reminders:check`.
- Standard app build, model tests and browser tests.

Dry-run bundle commands do not deploy. Worker tests use local runtime services and mock push transport, not a production database or a real learner's browser subscription. Tutor activation remains a separate eligible-provider setup; these Workers do not activate it.
