import { useEffect, useSyncExternalStore } from "react";
export interface Services {
  tutorUrl: string;
  pushUrl: string;
  pushPublicKey: string;
  loaded: boolean;
}
const endpoint = (value: unknown) => {
  if (typeof value !== "string" || !value) return "";
  try {
    const u = new URL(value, window.location.origin);
    return u.protocol === "https:" || u.origin === window.location.origin
      ? u.href.replace(/\/$/, "")
      : "";
  } catch {
    return "";
  }
};
let state: Services = {
  tutorUrl: endpoint(import.meta.env.VITE_TUTOR_URL),
  pushUrl: endpoint(import.meta.env.VITE_PUSH_URL),
  pushPublicKey: import.meta.env.VITE_PUSH_PUBLIC_KEY || "",
  loaded: false,
};
const listeners = new Set<() => void>();
let loading: Promise<Services> | null = null;
export function loadServices(): Promise<Services> {
  if (!loading)
    loading = (async () => {
      try {
        const r = await fetch("/services.json", {
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        if (!r.ok) throw Error();
        const data = await r.json();
        state = {
          tutorUrl: state.tutorUrl || endpoint(data.tutorUrl),
          pushUrl: state.pushUrl || endpoint(data.pushUrl),
          pushPublicKey:
            state.pushPublicKey ||
            (typeof data.pushPublicKey === "string" ? data.pushPublicKey : ""),
          loaded: true,
        };
      } catch {
        state = { ...state, loaded: true };
      }
      for (const listener of listeners) listener();
      return state;
    })();
  return loading;
}
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export function useServices() {
  const value = useSyncExternalStore(subscribe, () => state);
  useEffect(() => {
    void loadServices();
  }, []);
  return value;
}
