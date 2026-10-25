import { useEffect, useId, useMemo, useRef, useState } from "react";

/** A small seeded generator, so the sky is the same on every visit and in every test. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}
function starShadows(seed: number, count: number, colour: string) {
  const r = rng(seed);
  return Array.from(
    { length: count },
    () => `${(r() * 100).toFixed(1)}vw ${(r() * 100).toFixed(1)}vh ${colour}`,
  ).join(",");
}

/** Three layers of stars, each one element: tiny, medium and a few warm bright ones. Decorative. */
export function Starfield() {
  const layers = useMemo(
    () => [
      starShadows(11, 120, "rgb(236 230 214 / 0.7)"),
      starShadows(23, 42, "rgb(255 255 255 / 0.9)"),
      starShadows(37, 9, "0 0 3px rgb(240 184 74 / 0.9)"),
    ],
    [],
  );
  return (
    <div className="starfield" aria-hidden="true">
      {layers.map((boxShadow, i) => (
        <span
          key={i}
          className={`stars stars-${i + 1}`}
          style={{ boxShadow }}
        />
      ))}
    </div>
  );
}

/** A spiral galaxy seen at an angle: two arms of dots round a warm core. Decorative. */
export function Galaxy({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const dots = useMemo(() => {
    const r = rng(7);
    const out: { x: number; y: number; r: number; o: number; c: string }[] = [];
    for (let arm = 0; arm < 2; arm++)
      for (let i = 0; i < 170; i++) {
        const t = 0.03 + 0.97 * (i / 170);
        const radius = 10 + 84 * t;
        const angle =
          arm * Math.PI + t * 3.3 * Math.PI + (r() - 0.5) * 0.5 * (0.4 + t);
        const spread = (r() - 0.5) * (5 + 12 * t);
        out.push({
          x: Math.cos(angle) * (radius + spread),
          y: Math.sin(angle) * (radius + spread),
          r: 0.3 + r() * (0.85 - t * 0.3),
          o: 0.35 + r() * 0.65 * (1 - t * 0.45),
          c: t < 0.3 ? "#ffe3a3" : t < 0.65 ? "#f2e9d8" : "#b9cdf6",
        });
      }
    for (let i = 0; i < 160; i++) {
      const radius = Math.sqrt(r()) * 94;
      const angle = r() * Math.PI * 2;
      out.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        r: 0.25 + r() * 0.5,
        o: 0.2 + r() * 0.4,
        c: "#d9dff2",
      });
    }
    return out;
  }, []);
  return (
    <div className={`galaxy ${className}`} aria-hidden="true">
      <svg viewBox="-100 -100 200 200" focusable="false">
        <defs>
          <radialGradient id={`${id}-core`}>
            <stop offset="0" stopColor="#fff4d6" stopOpacity="0.95" />
            <stop offset="0.28" stopColor="#f0b84a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#f0b84a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-halo`}>
            <stop offset="0" stopColor="#8fa6d8" stopOpacity="0.3" />
            <stop offset="1" stopColor="#8fa6d8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r="98" fill={`url(#${id}-halo)`} />
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x.toFixed(1)}
            cy={d.y.toFixed(1)}
            r={d.r.toFixed(2)}
            fill={d.c}
            opacity={d.o.toFixed(2)}
          />
        ))}
        <circle r="30" fill={`url(#${id}-core)`} />
      </svg>
    </div>
  );
}

/** Shown while the app or a session is loading. Always on the night sky, in both themes. */
export function SkyLoader({ label = "Loading" }: { label?: string }) {
  return (
    <main id="main" className="sky-loader" role="status">
      <Starfield />
      <Galaxy className="loader-galaxy" />
      <span className="loader-button">
        <span className="loader-spinner" aria-hidden="true" />
        {label}…
      </span>
    </main>
  );
}

const SHOW_MS = 3800;
const LEAVE_MS = 450;
function prefersReducedMotion() {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * The startup animation. It plays on every full page load and can be skipped with Escape or the Skip
 * button. It does not play for people who ask for reduced motion.
 */
export function Startup() {
  const [phase, setPhase] = useState<"play" | "leave" | "done">(() =>
    prefersReducedMotion() ? "done" : "play",
  );
  const skip = useRef<HTMLButtonElement>(null);
  const leave = () => setPhase((p) => (p === "play" ? "leave" : p));
  useEffect(() => {
    if (phase === "play") {
      skip.current?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") leave();
      };
      window.addEventListener("keydown", onKey);
      const timer = setTimeout(leave, SHOW_MS);
      return () => {
        window.removeEventListener("keydown", onKey);
        clearTimeout(timer);
      };
    }
    if (phase === "leave") {
      const timer = setTimeout(() => setPhase("done"), LEAVE_MS);
      return () => clearTimeout(timer);
    }
  }, [phase]);
  if (phase === "done") return null;
  return (
    <div
      className={`startup${phase === "leave" ? " is-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Parallax is starting"
    >
      <Starfield />
      <svg
        className="startup-sight"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M0 100 L50 44" pathLength="1" />
        <path d="M100 100 L50 44" pathLength="1" />
      </svg>
      <div className="startup-stage">
        <Galaxy className="startup-galaxy" />
        <p className="startup-word">parallax</p>
        <p className="startup-tag">Two views. One distance.</p>
      </div>
      <button ref={skip} type="button" className="startup-skip" onClick={leave}>
        Skip <kbd>Esc</kbd>
      </button>
    </div>
  );
}
