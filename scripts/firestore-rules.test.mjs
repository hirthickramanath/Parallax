import { test } from "node:test";
import fs from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc } from "firebase/firestore";
test("Firestore permits only the owner and denies anonymous/cross-user/top-level access", async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST)
    throw Error(
      "Start the Firestore emulator before running this test. See docs/INTEGRATED-RELEASE.md.",
    );
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(":");
  const env = await initializeTestEnvironment({
    projectId: "demo-parallax",
    firestore: {
      host,
      port: Number(port),
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
  });
  try {
    const owner = env.authenticatedContext("owner").firestore(),
      other = env.authenticatedContext("other").firestore(),
      anonymous = env.unauthenticatedContext().firestore();
    const path = "users/owner/lessons/PB1.1";
    await assertSucceeds(setDoc(doc(owner, path), { status: "in_progress" }));
    await assertSucceeds(getDoc(doc(owner, path)));
    await assertFails(getDoc(doc(other, path)));
    await assertFails(setDoc(doc(other, path), { status: "done" }));
    await assertFails(getDoc(doc(anonymous, path)));
    await assertFails(
      setDoc(doc(owner, "unprotected/data"), { value: "deny" }),
    );
  } finally {
    await env.cleanup();
  }
});
