/**
 * Two views of the Moon: observers at two places on Earth see it against different background
 * stars. The shift between the two sight lines gives the angle that fixes the distance, d = b / angle.
 * Colours come from the theme tokens so the figure follows light, dark and every palette.
 */
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
export function TwoViewsPlate() {
  return (
    <svg
      className="two-views"
      viewBox="0 0 720 600"
      role="img"
      aria-labelledby="two-views-title two-views-desc"
    >
      <title id="two-views-title">Two views of the Moon</title>
      <desc id="two-views-desc">
        Two observers stand far apart on Earth. Each sees the nearby Moon
        against a different place among the distant stars. The angle between the
        two lines of sight, together with the distance between the observers,
        gives the distance to the Moon.
      </desc>
      <g className="tv-backdrop">
        {backdrop.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" />
        ))}
      </g>
      <line className="tv-axis" x1="24" y1="46" x2="696" y2="46" />
      {/* Earth, a large disc entering from below */}
      <circle className="tv-earth" cx="360" cy="740" r="260" />
      {/* the baseline between the observers */}
      <line className="tv-axis" x1="200" y1="535" x2="520" y2="535" />
      {/* lines of sight from each observer through the Moon to the far stars */}
      <line className="tv-sight" x1="200" y1="535" x2="434" y2="46" />
      <line className="tv-sight" x1="520" y1="535" x2="286" y2="46" />
      <line className="tv-axis" x1="360" y1="535" x2="360" y2="230" />
      {/* where each observer sees the Moon against the stars */}
      <circle className="tv-ghost" cx="434" cy="46" r="7" />
      <circle className="tv-ghost" cx="286" cy="46" r="7" />
      {/* the Moon and the angle between the two views */}
      <circle className="tv-moon" cx="360" cy="200" r="16" />
      <path className="tv-arc" d="M 347 232 A 36 36 0 0 0 373 232" />
      {/* the two observers */}
      <circle className="tv-observer" cx="200" cy="535" r="8" />
      <circle className="tv-observer" cx="520" cy="535" r="8" />
      <g className="tv-text" aria-hidden="true">
        <text x="434" y="30" textAnchor="middle">
          seen by A
        </text>
        <text x="286" y="30" textAnchor="middle">
          seen by B
        </text>
        <text x="696" y="76" textAnchor="end">
          distant stars, fixed
        </text>
        <text x="388" y="204">
          the Moon
        </text>
        <text x="360" y="262" textAnchor="middle">
          angle
        </text>
        <text x="360" y="558" textAnchor="middle">
          baseline b
        </text>
        <text x="200" y="572" textAnchor="middle">
          observer A
        </text>
        <text x="520" y="572" textAnchor="middle">
          observer B
        </text>
      </g>
    </svg>
  );
}
