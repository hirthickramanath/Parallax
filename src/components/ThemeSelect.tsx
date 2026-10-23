import { useEffect, useSyncExternalStore } from "react";
const transient: Record<string, string> = {};
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
    palette = useSyncExternalStore(subscribe, () =>
      read("parallax-palette", "ink"),
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
          <option value="ink">Ink blue</option>
          <option value="forest">Forest</option>
          <option value="cosmic">Cosmic violet</option>
          <option value="ocean">Ocean blue</option>
          <option value="ember">Ember</option>
        </select>
      </label>
    </div>
  );
}

export function AppearanceSync() {
  const theme = useSyncExternalStore(subscribe, () =>
      read("parallax-theme", "system"),
    ),
    palette = useSyncExternalStore(subscribe, () =>
      read("parallax-palette", "ink"),
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
