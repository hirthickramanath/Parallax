/**
 * The landing picture: a ringed planet and its moon, a small spiral galaxy and a field of stars.
 * It is a night scene whatever the page theme, so its colours are fixed rather than themed.
 */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const random = rng(7);
const stars = Array.from({ length: 70 }, () => ({
  x: Math.round(random() * 720),
  y: Math.round(random() * 560),
  r: +(0.6 + random() * 1.5).toFixed(1),
  o: +(0.35 + random() * 0.6).toFixed(2),
}));
// Two logarithmic spiral arms of dust around the galaxy's centre.
const arms = [0, Math.PI].flatMap((offset) =>
  Array.from({ length: 46 }, (_, i) => {
    const t = i / 45;
    const angle = offset + t * 4.2;
    const radius = 6 + t * 66 + (random() - 0.5) * 7;
    return {
      x: +(Math.cos(angle) * radius).toFixed(1),
      y: +(Math.sin(angle) * radius * 0.46).toFixed(1),
      r: +(0.7 + (1 - t) * 1.3).toFixed(1),
      o: +(0.25 + (1 - t) * 0.6).toFixed(2),
    };
  }),
);

export function SkyPlate() {
  return (
    <svg
      className="sky-plate"
      viewBox="0 0 720 560"
      role="img"
      aria-labelledby="sky-plate-title sky-plate-desc"
    >
      <title id="sky-plate-title">A ringed planet, a moon and a galaxy</title>
      <desc id="sky-plate-desc">
        A night sky. A banded planet with a wide ring sits at the lower left
        with a small moon beside it, a spiral galaxy glows at the upper right,
        and stars are scattered across the dark.
      </desc>
      <defs>
        <linearGradient id="sp-sky" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#0b0d16" />
          <stop offset="1" stopColor="#171320" />
        </linearGradient>
        <radialGradient id="sp-planet" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#f6dfa6" />
          <stop offset="0.45" stopColor="#d49a45" />
          <stop offset="1" stopColor="#3a2412" />
        </radialGradient>
        <radialGradient id="sp-moon" cx="0.3" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#f1ece0" />
          <stop offset="0.6" stopColor="#a9a597" />
          <stop offset="1" stopColor="#3f3e44" />
        </radialGradient>
        <radialGradient id="sp-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4d6" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#f0b84a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f0b84a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sp-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#8fa6ff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#8fa6ff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="sp-back">
          <rect x="-200" y="-200" width="400" height="200" />
        </clipPath>
        <clipPath id="sp-front">
          <rect x="-200" y="0" width="400" height="200" />
        </clipPath>
        <clipPath id="sp-disc">
          <circle cx="0" cy="0" r="92" />
        </clipPath>
      </defs>
      <rect width="720" height="560" fill="url(#sp-sky)" />
      <g fill="#ece6d6">
        {stars.map((s) => (
          <circle
            key={`${s.x}-${s.y}`}
            cx={s.x}
            cy={s.y}
            r={s.r}
            opacity={s.o}
          />
        ))}
      </g>

      {/* spiral galaxy */}
      <g transform="translate(556 150) rotate(-24)">
        <ellipse rx="112" ry="62" fill="url(#sp-halo)" />
        <g fill="#cdd6ff">
          {arms.map((a) => (
            <circle
              key={`${a.x}-${a.y}`}
              cx={a.x}
              cy={a.y}
              r={a.r}
              opacity={a.o}
            />
          ))}
        </g>
        <ellipse rx="30" ry="15" fill="url(#sp-core)" />
      </g>

      {/* shooting star */}
      <path
        d="M 318 78 L 214 128"
        stroke="#ece6d6"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="318" cy="78" r="2.4" fill="#fff4d6" />

      {/* moon's orbit and the moon */}
      <ellipse
        cx="222"
        cy="388"
        rx="196"
        ry="70"
        transform="rotate(-18 222 388)"
        fill="none"
        stroke="#ece6d6"
        strokeOpacity="0.22"
        strokeDasharray="2 7"
      />
      <circle cx="418" cy="332" r="19" fill="url(#sp-moon)" />
      <path
        d="M 418 313 A 19 19 0 0 1 418 351 A 13 19 0 0 0 418 313 Z"
        fill="#0b0d16"
        opacity="0.55"
      />

      {/* planet with its ring: the far half behind, the near half in front */}
      <g transform="translate(222 388) rotate(-18)">
        <g clipPath="url(#sp-back)">
          <ellipse
            rx="176"
            ry="42"
            fill="none"
            stroke="#c8934a"
            strokeOpacity="0.55"
            strokeWidth="14"
          />
          <ellipse
            rx="150"
            ry="35"
            fill="none"
            stroke="#f0d089"
            strokeOpacity="0.35"
            strokeWidth="5"
          />
        </g>
        <circle r="92" fill="url(#sp-planet)" />
        <g
          clipPath="url(#sp-disc)"
          fill="none"
          stroke="#7a4a1c"
          strokeOpacity="0.28"
        >
          <ellipse cy="-26" rx="100" ry="14" strokeWidth="6" />
          <ellipse cy="6" rx="100" ry="16" strokeWidth="9" />
          <ellipse cy="40" rx="100" ry="14" strokeWidth="5" />
        </g>
        <circle r="92" fill="none" stroke="#fff4d6" strokeOpacity="0.12" />
        <g clipPath="url(#sp-front)">
          <ellipse
            rx="176"
            ry="42"
            fill="none"
            stroke="#c8934a"
            strokeOpacity="0.9"
            strokeWidth="14"
          />
          <ellipse
            rx="150"
            ry="35"
            fill="none"
            stroke="#f0d089"
            strokeOpacity="0.6"
            strokeWidth="5"
          />
        </g>
      </g>
    </svg>
  );
}
