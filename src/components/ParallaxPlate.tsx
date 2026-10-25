/**
 * The parallax diagram: Earth at two points of its orbit sees a nearby star against different
 * background stars. The apparent shift, halved, is the parallax angle p, and d = 1/p.
 * Colours come from the theme tokens so the figure follows light, dark and every palette.
 */
export function ParallaxPlate({ labelled = true }: { labelled?: boolean }) {
  // Sight lines from each Earth position through the near star to the background line at y = 46.
  const backdrop = [
    [60, 30],
    [112, 62],
    [168, 24],
    [214, 58],
    [330, 26],
    [388, 60],
    [512, 30],
    [588, 58],
    [640, 24],
    [684, 62],
    [96, 92],
    [610, 96],
    [36, 74],
    [700, 36],
  ];
  return (
    <svg
      className="plate"
      viewBox="0 0 720 560"
      role="img"
      aria-labelledby="plate-title plate-desc"
    >
      <title id="plate-title">How parallax measures distance</title>
      <desc id="plate-desc">
        Earth is shown on opposite sides of the Sun, six months apart. From each
        position a nearby star appears against a different place among distant
        background stars. Half of that apparent shift is the parallax angle p.
      </desc>
      <g className="plate-backdrop">
        {backdrop.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" />
        ))}
      </g>
      <line className="plate-axis" x1="24" y1="46" x2="696" y2="46" />
      {/* orbit, tilted into view */}
      <ellipse className="plate-orbit" cx="360" cy="452" rx="196" ry="64" />
      {/* sight lines */}
      <line className="plate-sight" x1="164" y1="452" x2="452" y2="46" />
      <line className="plate-sight" x1="556" y1="452" x2="268" y2="46" />
      <line className="plate-axis" x1="360" y1="452" x2="360" y2="170" />
      {/* apparent positions of the near star */}
      <circle className="plate-ghost" cx="452" cy="46" r="7" />
      <circle className="plate-ghost" cx="268" cy="46" r="7" />
      {/* the near star and the angle p */}
      <circle className="plate-star" cx="360" cy="170" r="9" />
      <path className="plate-arc" d="M 345 200 A 34 34 0 0 1 375 200" />
      {/* Sun and the two Earths */}
      <circle className="plate-sun" cx="360" cy="452" r="15" />
      <circle className="plate-earth" cx="164" cy="452" r="9" />
      <circle className="plate-earth" cx="556" cy="452" r="9" />
      {labelled && (
        <g className="plate-text" aria-hidden="true">
          <text x="452" y="30" textAnchor="middle">
            seen in January
          </text>
          <text x="268" y="30" textAnchor="middle">
            seen in July
          </text>
          <text x="696" y="76" textAnchor="end">
            distant stars, fixed
          </text>
          <text x="384" y="174">
            nearby star
          </text>
          <text x="360" y="232" textAnchor="middle">
            p
          </text>
          <text x="164" y="486" textAnchor="middle">
            Earth, January
          </text>
          <text x="556" y="486" textAnchor="middle">
            Earth, July
          </text>
          <text x="360" y="486" textAnchor="middle">
            Sun
          </text>
        </g>
      )}
    </svg>
  );
}
