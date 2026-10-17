import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import {
  emptyRecords,
  activityDay,
  dateKey,
  mergeDay,
  collections,
  mergeDocument,
} from "../lib/learning-core";
import type { Collection, Preferences, Records } from "../types/learning";
interface Pending {
  kind: Collection;
  id: string;
  value: object;
  version: number;
}
class LearningStore {
  uid: string;
  records = emptyRecords();
  pending: Record<string, Pending> = {};
  listeners = new Set<() => void>();
  revision = 0;
  status = "Loading local progress…";
  storageError = false;
  started = false;
  loaded = false;
  busy = false;
  preferences: Preferences = {
    depth: "full",
    dailyGoal: 20,
    strictLocking: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    retention: 0.9,
    newCards: 10,
  };
  constructor(uid: string) {
    this.uid = uid;
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const data = JSON.parse(raw);
        this.records = { ...emptyRecords(), ...data.records };
        this.pending = data.pending || {};
        this.preferences = { ...this.preferences, ...data.preferences };
      }
    } catch {
      this.storageError = true;
    }
    this.status = this.storageError
      ? "Browser storage unavailable; keep this tab open."
      : Object.keys(this.pending).length
        ? "Saved on this device · waiting to sync"
        : "Saved on this device";
  }
  get key() {
    return `parallax-learning-v1:${this.uid}`;
  }
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  snapshot = () => this.revision;
  emit() {
    this.revision++;
    for (const listener of this.listeners) listener();
  }
  persist() {
    try {
      localStorage.setItem(
        this.key,
        JSON.stringify({
          records: this.records,
          pending: this.pending,
          preferences: this.preferences,
        }),
      );
    } catch {
      this.storageError = true;
      this.status = "Browser storage unavailable; keep this tab open.";
    }
    this.emit();
  }
  setPreferences(patch: Partial<Preferences>) {
    this.preferences = { ...this.preferences, ...patch };
    this.persist();
  }
  put<K extends Collection>(kind: K, id: string, value: Records[K][string]) {
    (this.records[kind] as Record<string, unknown>)[id] = value;
    this.pending[`${kind}/${id}`] = {
      kind,
      id,
      value,
      version: Date.now() + Math.random(),
    };
    this.status = "Saved on this device · syncing";
    this.persist();
    void this.sync();
  }
  award(id: string, xp: number, track: string) {
    const key = dateKey(Date.now(), this.preferences.timezone);
    const day = activityDay(
      { id, xp, track, at: Date.now() },
      this.preferences.dailyGoal,
    );
    this.put(
      "days",
      key,
      mergeDay(this.records.days[key], day, this.preferences.dailyGoal),
    );
  }
  receive(raw: string) {
    try {
      const other = JSON.parse(raw) as {
        records: Records;
        pending: Record<string, Pending>;
        preferences: Preferences;
      };
      for (const kind of collections)
        for (const [id, value] of Object.entries(other.records[kind] || {}))
          (this.records[kind] as Record<string, unknown>)[id] = mergeDocument(
            kind,
            (this.records[kind] as Record<string, object>)[id],
            value as object,
            this.preferences.dailyGoal,
          );
      for (const [key, p] of Object.entries(other.pending || {}))
        if (!this.pending[key] || p.version > this.pending[key].version)
          this.pending[key] = p;
      this.preferences = { ...this.preferences, ...other.preferences };
      this.emit();
      if (Object.keys(this.pending).length) void this.sync();
    } catch {
      this.status =
        "Another tab has unreadable local data; export this tab’s progress.";
      this.emit();
    }
  }
  async start() {
    if (this.started) return;
    this.started = true;
    try {
      const { dataStore } = await import("../lib/datastore");
      const remote = await dataStore.load(this.uid);
      for (const kind of collections)
        for (const [id, value] of Object.entries(remote[kind])) {
          if (this.pending[`${kind}/${id}`]) {
            if (kind === "days") {
              const day = mergeDay(
                value as Records["days"][string],
                this.records.days[id],
                this.preferences.dailyGoal,
              );
              this.records.days[id] = day;
              this.pending[`${kind}/${id}`].value = day;
            }
            continue;
          }
          (this.records[kind] as Record<string, unknown>)[id] = mergeDocument(
            kind,
            (this.records[kind] as Record<string, object>)[id],
            value as object,
            this.preferences.dailyGoal,
          );
        }
      this.loaded = true;
      this.status = "Synced";
      this.persist();
      await this.sync();
    } catch {
      this.started = false;
      this.status = "Saved on this device · cloud access unavailable";
      this.emit();
    }
  }
  async sync() {
    if (this.busy || !navigator.onLine) return;
    this.busy = true;
    try {
      const { dataStore } = await import("../lib/datastore");
      for (const [key, entry] of Object.entries(this.pending)) {
        const merged = await dataStore.save(
          this.uid,
          entry.kind,
          entry.id,
          entry.value,
          this.preferences.dailyGoal,
        );
        if (this.pending[key]?.version === entry.version) {
          delete this.pending[key];
          (this.records[entry.kind] as Record<string, unknown>)[entry.id] =
            merged;
        }
        this.persist();
      }
      this.status = Object.keys(this.pending).length
        ? "Saved on this device · syncing"
        : this.loaded
          ? "Synced"
          : "Saved on this device · cloud connection unverified";
      if (Object.keys(this.pending).length)
        setTimeout(() => void this.sync(), 0);
    } catch {
      this.status = "Saved on this device · cloud sync pending";
    } finally {
      this.busy = false;
      this.emit();
    }
  }
}
const Context = createContext<LearningStore | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const store = useMemo(
    () => (user ? new LearningStore(user.uid) : null),
    [user?.uid],
  );
  useEffect(() => {
    if (!store) return;
    void store.start();
    const online = () => {
      if (!store.loaded) void store.start();
      else void store.sync();
    };
    window.addEventListener("online", online);
    const storage = (e: StorageEvent) => {
      if (e.key === store.key && e.newValue) store.receive(e.newValue);
    };
    window.addEventListener("storage", storage);
    const timer = setInterval(online, 30000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", online);
      window.removeEventListener("storage", storage);
    };
  }, [store]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useLearning() {
  const store = useContext(Context);
  if (!store) throw Error("Learning features require sign-in");
  useSyncExternalStore(store.subscribe, store.snapshot);
  return store;
}
export function useClock() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
