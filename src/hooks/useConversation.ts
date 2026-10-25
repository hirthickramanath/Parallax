import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "./useAuth";
/** Chemistry bridge lessons were CB.n before they became CB1.n. */
const retiredId = (id: string) => id.replace(/^CB1\.(\d+)$/, "CB.$1");
export interface ChatMessage {
  id: string;
  lessonId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}
class Conversation {
  messages: ChatMessage[] = [];
  pending = new Set<string>();
  listeners = new Set<() => void>();
  revision = 0;
  busy = false;
  status = "Conversation saved on this device";
  constructor(
    readonly uid: string,
    readonly lessonId: string,
  ) {
    try {
      const value = JSON.parse(
        localStorage.getItem(this.key) ||
          localStorage.getItem(
            `parallax-chat-v1:${this.uid}:${retiredId(this.lessonId)}`,
          ) ||
          "null",
      );
      if (value) {
        this.messages = value.messages || [];
        this.pending = new Set(value.pending || []);
      }
    } catch {
      this.status = "Conversation storage unavailable";
    }
  }
  get id() {
    return `lesson-${this.lessonId}`;
  }
  get key() {
    return `parallax-chat-v1:${this.uid}:${this.lessonId}`;
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  snapshot = () => this.revision;
  emit() {
    this.revision++;
    for (const l of this.listeners) l();
  }
  persist() {
    try {
      localStorage.setItem(
        this.key,
        JSON.stringify({ messages: this.messages, pending: [...this.pending] }),
      );
    } catch {
      this.status = "Conversation could not be saved locally";
    }
    this.emit();
  }
  append(role: "user" | "assistant", content: string) {
    const message = {
      id: crypto.randomUUID(),
      lessonId: this.lessonId,
      role,
      content,
      createdAt: Date.now(),
    };
    this.messages = [...this.messages, message];
    this.pending.add(message.id);
    this.persist();
    return message.id;
  }
  replace(id: string, content: string) {
    this.messages = this.messages.map((m) =>
      m.id === id ? { ...m, content: content.slice(0, 20000) } : m,
    );
    this.pending.add(id);
    this.persist();
  }
  async load() {
    try {
      const { dataStore } = await import("../lib/datastore");
      const earlier = retiredId(this.lessonId);
      const remote = [
        ...(earlier === this.lessonId
          ? []
          : (
              await dataStore.loadConversation(this.uid, `lesson-${earlier}`)
            ).map((m) => ({ ...m, lessonId: this.lessonId }))),
        ...(await dataStore.loadConversation(this.uid, this.id)),
      ];
      const byId = new Map(remote.map((m) => [m.id, m]));
      for (const message of this.messages)
        if (this.pending.has(message.id) || !byId.has(message.id))
          byId.set(message.id, message);
      this.messages = [...byId.values()]
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(-100);
      this.persist();
      await this.flush();
    } catch {
      this.status = "Conversation saved locally · cloud read unavailable";
      this.emit();
    }
  }
  async flush() {
    if (this.busy || !navigator.onLine || !this.pending.size) return;
    this.busy = true;
    const ids = [...this.pending];
    const pending = this.messages
      .filter((m) => ids.includes(m.id))
      .slice(0, 100);
    try {
      const { dataStore } = await import("../lib/datastore");
      await dataStore.saveConversation(
        this.uid,
        this.id,
        this.lessonId,
        pending,
      );
      for (const original of pending)
        if (
          this.messages.find((m) => m.id === original.id)?.content ===
          original.content
        )
          this.pending.delete(original.id);
      this.messages = this.messages.filter(
        (m, i) => i >= this.messages.length - 100 || this.pending.has(m.id),
      );
      this.status = this.pending.size
        ? "Conversation saved locally · cloud sync pending"
        : "Conversation synced";
      this.persist();
    } catch {
      this.status = "Conversation saved locally · cloud sync pending";
      this.emit();
    } finally {
      this.busy = false;
    }
  }
}
export function useConversation(lessonId: string) {
  const { user } = useAuth();
  const conversation = useMemo(
    () => new Conversation(user!.uid, lessonId),
    [user?.uid, lessonId],
  );
  useSyncExternalStore(conversation.subscribe, conversation.snapshot);
  useEffect(() => {
    void conversation.load();
    const flush = () => void conversation.flush();
    window.addEventListener("online", flush);
    const timer = setInterval(flush, 30000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", flush);
    };
  }, [conversation]);
  return conversation;
}
