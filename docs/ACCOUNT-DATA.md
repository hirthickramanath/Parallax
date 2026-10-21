# Account data and deletion

**Finding: there is no way for a learner to delete their account or their cloud data from the app.** `grep` finds no `deleteUser` or `deleteDoc` call in `src/`, no deletion control in Settings, and no deletion route in any Worker. The Firestore rules allow a signed-in learner to read and write (including delete) only documents under their own `users/{uid}/`, so the permission exists, but nothing in the interface uses it. This was found by reading the code, not by running it against production.

What a learner can do today: **export** progress (Settings, Memory & data), **import** a backup, **restart** the learning journey and **unsubscribe** a device from background reminders.

## Where a learner's data lives

| Place | What | Removed by |
| --- | --- | --- |
| Firebase Authentication | Account (Google or email-link identity, display name, email) | Nothing in the app. Only the project owner in the Firebase console, or a client `deleteUser()` call that does not exist yet. |
| Firestore `users/{uid}/…` | Progress records, cards and projects, and chat documents (`chats/{id}/messages`) written by `src/lib/datastore.ts` | Nothing in the app. Restarting the journey resets progress; whether it deletes the underlying documents was not checked. |
| Browser storage on each device | Local-first copy of progress and preferences, saved lesson JSON | The learner clearing site data (Settings says so on shared devices). |
| Reminders Worker (Durable Object) | One record per learner: timezone, reminder time, and each subscribed device's push endpoint and keys | Unsubscribing every device deletes the record. Otherwise nothing. |
| Tutor Worker (Durable Object) | Up to 200 request timestamps per learner for the usage limit; no message text | Nothing; old timestamps are pruned only when that learner next calls the tutor. |
| Assessment Worker (Durable Object) | Receipts per learner. The Worker is disabled, so none are being written. | Nothing. |
| Workers AI | The tutor sends the lesson text and the learner's message to the model for each reply. Parallax logs only reply length. | Governed by the model provider's own terms; not verified here. |

## What a complete deletion would need

1. Unsubscribe all reminder devices (the reminders Worker's `DELETE /subscription` already does this per device) so the push endpoints are dropped.
2. Delete every document under `users/{uid}/` including the `chats/*/messages` subcollections. Firestore has no client-side recursive delete, so either walk the collections from the client (the data layer in `src/lib/datastore.ts` already lists them) or use the Firebase "Delete User Data" extension or an Admin SDK function.
3. Delete the Firebase Auth user. The client call `deleteUser()` requires a recent sign-in, so the flow must ask the learner to re-authenticate.
4. Clear local storage and the service-worker caches on that device.
5. Decide what happens to the tutor and assessment counters (they hold only timestamps or receipts keyed by the account id). They can age out, or a Worker route can clear them.
6. State the rule in the privacy text: what is deleted at once, what lingers (browser copies on other devices, backups, provider logs) and how long.

## Open decisions for the owner

- Whether to build this in-app (re-authentication, confirmation, progress indicator, error handling) or to handle deletion by email request for the pilot. A destructive feature was deliberately not written without that decision and without a way to test it against a real Firebase project.
- Whether the product will have learners under 18 or in the EU/UK, which changes the legal requirement for erasure and consent. Parallax records no age; this is a legal question that needs the owner's advice, not an engineering default.
- Retention period for chat history stored under the learner's account, if the app keeps any (the `chats` path exists in the data layer; what writes to it was not traced).
