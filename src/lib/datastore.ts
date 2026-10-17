import {
  doc,
  collection,
  getDocs,
  runTransaction,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { app } from "./firebase";
import { collections, emptyRecords, mergeDocument } from "./learning-core";
import type { Collection, Records } from "../types/learning";
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
export interface DataStore {
  load(uid: string): Promise<Records>;
  save(
    uid: string,
    kind: Collection,
    id: string,
    value: object,
    goal: number,
  ): Promise<object>;
}
export const dataStore: DataStore = {
  async load(uid) {
    const records = emptyRecords();
    await Promise.all(
      collections.map(async (kind) => {
        const result = await getDocs(collection(db, "users", uid, kind));
        for (const document of result.docs)
          (records[kind] as Record<string, unknown>)[document.id] =
            document.data();
      }),
    );
    return records;
  },
  async save(uid, kind, id, value, goal) {
    const ref = doc(db, "users", uid, kind, id);
    return runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      let next: object = JSON.parse(JSON.stringify(value));
      next = mergeDocument(
        kind,
        snap.exists() ? snap.data() : undefined,
        next,
        goal,
      );
      tx.set(ref, next);
      return next;
    });
  },
};
