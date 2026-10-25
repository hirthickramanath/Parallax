import { useId, useState } from "react";

/** A working example of d = 1/p: move the star and watch how little it shifts. */
export function ParallaxTry() {
  const id = useId();
  const [d, setD] = useState(1.3);
  const p = 1 / d; // parallax in arcseconds when d is in parsecs
  const shift = Math.min(100, 2 * p * 50); // two-position shift as a share of the strip
  const left = 50 - shift / 2;
  return (
    <div className="try">
      <label htmlFor={id}>Distance to the star</label>
      <input
        id={id}
        type="range"
        min="1"
        max="20"
        step="0.1"
        value={d}
        onChange={(e) => setD(Number(e.target.value))}
      />
      <dl className="try-readout">
        <div>
          <dt>distance d</dt>
          <dd>{d.toFixed(1)} parsecs</dd>
        </div>
        <div>
          <dt>parallax p = 1 / d</dt>
          <dd>{p.toFixed(3)} arcseconds</dd>
        </div>
      </dl>
      <div className="try-strip" aria-hidden="true">
        <span className="try-mark" style={{ left: `${left}%` }} />
        <span className="try-mark" style={{ left: `${left + shift}%` }} />
        <span
          className="try-span"
          style={{ left: `${left}%`, width: `${shift}%` }}
        />
      </div>
      <p className="try-note">
        The two marks are where the star appears in January and in July against
        the distant background. Proxima Centauri, the nearest star, is about 1.3
        parsecs away, so its parallax angle is about 0.77 arcseconds, and the shift
        between January and July is twice that. Move the slider out and the
        shift nearly vanishes, which is why measuring distance this way takes
        careful instruments.
      </p>
    </div>
  );
}
