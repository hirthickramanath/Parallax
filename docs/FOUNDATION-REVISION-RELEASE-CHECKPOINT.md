# Foundation revision release checkpoint — 19 October 2026

The environment publication is now applied: runtime observations report enforced network rules and ready Cloudflare bindings. Actual read-only Cloudflare requests succeeded. Before this release, production deployment `437a4d6f-98f4-4e42-9728-10ce28b5a4ae` was successful at commit `95c76b4b61fb5c27a70baa0e3dfb385493d9947c`; real HTTP verification matched entry assets and four representative lesson JSON files to that production build. This supersedes the environment-access blocker recorded in the earlier follow-up. It does not establish signed-in Firebase behavior or enable optional paid services.

The new guided revision route is described in [FOUNDATION-REVISION-PATH.md](FOUNDATION-REVISION-PATH.md). Validation: 652 unit/content/model/evidence tests passed; TypeScript and production build passed; three targeted browser tests passed, exercising every foundation chapter and the saved revision flow. The full browser regression passed all 113 tests (including the 38-chapter mobile sweep). The final production build and all three focused revision browser tests also passed after the last copy/answer-order edits. Push-triggered production deployment is then checked through the read-only Cloudflare API and real HTTP asset comparisons; these checks do not authenticate to learner accounts.

Scientific review remains incomplete. Existing partial source mappings do not become independent approvals; the new revision collection also remains draft. Learner trial evidence remains qualitative and chat-only until the learner actually studies in the app and supplies recorded answers and later recall. No learner results or private responses are committed.

Firestore emulator validation now also passes: one executed integration test verifies owner read/write, cross-user read/write denial, anonymous denial and denial outside user-scoped paths. The official artifact downloaded successfully with verification retained after setting the CLI-supported `FIREBASE_EMULATORS_PATH=/tmp/parallax-firebase-emulators` to avoid the read-only home cache. Use the existing inherited proxy/CA and a demo project:

```bash
FIREBASE_EMULATORS_PATH=/tmp/parallax-firebase-emulators npm_config_cache=/tmp/parallax-npm-cache XDG_CONFIG_HOME=/tmp/parallax-firebase-config npm exec --yes --package=firebase-tools -- firebase emulators:exec --project demo-parallax --only firestore 'npm run test:rules'
```

This is emulator evidence for repository rules, not proof that identical rules are published or that production cross-device synchronization succeeds.
