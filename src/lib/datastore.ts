import {
  doc,
  query,
  orderBy,
  limitToLast,
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
import type { ChatMessage } from "../hooks/useConversation";
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
export interface DataStore {
  loadConversation(uid: string, id: string): Promise<ChatMessage[]>;
  saveConversation(
    uid: string,
    id: string,
    lessonId: string,
    messages: ChatMessage[],
  ): Promise<void>;
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
  async loadConversation(uid, id) {
    const result = await getDocs(
      query(
        collection(db, "users", uid, "chats", id, "messages"),
        orderBy("createdAt"),
        limitToLast(100),
      ),
    );
    return result.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage);
  },
  async saveConversation(uid, id, lessonId, messages) {
    if (!messages.length) return;
    const root = doc(db, "users", uid, "chats", id);
    await runTransaction(db, async (tx) => {
      const parent = await tx.get(root);
      if (!parent.exists())
        tx.set(root, { lessonId, createdAt: messages[0].createdAt });
      for (const { id: messageId, ...message } of messages)
        tx.set(
          doc(db, "users", uid, "chats", id, "messages", messageId),
          message,
        );
    });
  },
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
