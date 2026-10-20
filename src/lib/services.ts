import { useEffect, useSyncExternalStore } from "react";
import deployment from "../../public/services.json";
export interface Services {
  tutorUrl: string;
  pushUrl: string;
  pushPublicKey: string;
  loaded: boolean;
  error: string;
}
const endpoint = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const u = new URL(value.trim(), window.location.origin);
    return u.protocol === "https:" || u.origin === window.location.origin
      ? u.href.replace(/\/$/, "")
      : "";
  } catch {
    return "";
  }
};
const configured = {
  tutorUrl: endpoint(import.meta.env.VITE_TUTOR_URL || deployment.tutorUrl),
  pushUrl: endpoint(import.meta.env.VITE_PUSH_URL || deployment.pushUrl),
  pushPublicKey:
    import.meta.env.VITE_PUSH_PUBLIC_KEY || deployment.pushPublicKey,
};
let state: Services = { ...configured, loaded: false, error: "" };
const listeners = new Set<() => void>();
let loading: Promise<Services> | null = null;
export function loadServices(force = false): Promise<Services> {
  if (loading) return loading;
  if (state.loaded && !force) return Promise.resolve(state);
  loading = (async () => {
    try {
      const r = await fetch("/services.json", {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw Error();
      const data = await r.json();
      if (
        !data ||
        !["tutorUrl", "pushUrl", "pushPublicKey"].every(
          (key) => typeof data[key] === "string",
        )
      )
        throw Error();
      state = {
        tutorUrl: endpoint(import.meta.env.VITE_TUTOR_URL || data.tutorUrl),
        pushUrl: endpoint(import.meta.env.VITE_PUSH_URL || data.pushUrl),
        pushPublicKey:
          import.meta.env.VITE_PUSH_PUBLIC_KEY || data.pushPublicKey,
        loaded: true,
        error: "",
      };
    } catch {
      // A transient config fetch failure must not erase the deployment's known endpoints.
      state = {
        ...state,
        loaded: true,
        error:
          "Could not refresh service settings. Using this build’s saved connection.",
      };
    } finally {
      loading = null;
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
    const retry = () => {
      if (state.error || !state.tutorUrl) void loadServices(true);
    };
    window.addEventListener("online", retry);
    window.addEventListener("focus", retry);
    return () => {
      window.removeEventListener("online", retry);
      window.removeEventListener("focus", retry);
    };
  }, []);
  return value;
}
