import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
const transient: Record<string, string> = {};
const palettes = ["brass", "cyanotype", "madder", "lichen", "graphite"];
/** An unknown stored palette (for example one from an earlier version) falls back to the default. */
function validPalette(value: string) {
  return palettes.includes(value) ? value : "brass";
}
const event = "parallax-appearance";
function read(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || transient[key] || fallback;
  } catch {
    return transient[key] || fallback;
  }
}
function subscribe(fn: () => void) {
  window.addEventListener(event, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(event, fn);
    window.removeEventListener("storage", fn);
  };
}
function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    transient[key] = value;
  }
  document.documentElement.dataset[
    key === "parallax-theme" ? "theme" : "palette"
  ] = value;
  window.dispatchEvent(new Event(event));
}
function useResolvedDark() {
  const theme = useSyncExternalStore(subscribe, () =>
    read("parallax-theme", "system"),
  );
  const systemDark = useSyncExternalStore(
    (fn) => {
      const media = matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", fn);
      return () => media.removeEventListener("change", fn);
    },
    () => matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );
  return theme === "system" ? systemDark : theme === "dark";
}

/** Light/dark switch and a colour-theme button, sized for the header beside the profile button. */
export function AppearanceToggles() {
  const dark = useResolvedDark(),
    palette = validPalette(
      useSyncExternalStore(subscribe, () => read("parallax-palette", "brass")),
    ),
    next = palettes[(palettes.indexOf(palette) + 1) % palettes.length],
    name = (id: string) => id[0].toUpperCase() + id.slice(1);
  return (
    <div className="appearance-toggles">
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        className="mode-switch"
        onClick={() => save("parallax-theme", dark ? "light" : "dark")}
      >
        <Sun size={13} aria-hidden="true" />
        <Moon size={13} aria-hidden="true" />
        <span className="mode-knob" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="palette-button"
        data-palette-name={palette}
        aria-label={`Color theme: ${name(palette)}. Switch to ${name(next)}`}
        title={`Color theme: ${name(palette)}`}
        onClick={() => save("parallax-palette", next)}
      >
        <span className="palette-dot" aria-hidden="true" />
      </button>
    </div>
  );
}

export function AppearanceSync() {
  const theme = useSyncExternalStore(subscribe, () =>
      read("parallax-theme", "system"),
    ),
    palette = validPalette(
      useSyncExternalStore(subscribe, () => read("parallax-palette", "brass")),
    );
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.palette = palette;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme, palette]);
  return null;
}
