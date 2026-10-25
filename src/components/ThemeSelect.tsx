import { useEffect, useSyncExternalStore } from "react";
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
export function ThemeSelect() {
  const theme = useSyncExternalStore(subscribe, () =>
      read("parallax-theme", "system"),
    ),
    palette = validPalette(
      useSyncExternalStore(subscribe, () => read("parallax-palette", "brass")),
    );
  return (
    <div className="appearance-controls">
      <label className="theme-label">
        <span>Appearance</span>
        <select
          aria-label="Appearance"
          value={theme}
          onChange={(e) => save("parallax-theme", e.target.value)}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label className="theme-label">
        <span>Color theme</span>
        <select
          aria-label="Color theme"
          value={palette}
          onChange={(e) => save("parallax-palette", e.target.value)}
        >
          <option value="brass">Brass</option>
          <option value="cyanotype">Cyanotype</option>
          <option value="madder">Madder</option>
          <option value="lichen">Lichen</option>
          <option value="graphite">Graphite</option>
        </select>
      </label>
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
