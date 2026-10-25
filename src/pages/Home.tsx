import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ParallaxPlate } from "../components/ParallaxPlate";
import { ParallaxTry } from "../components/ParallaxTry";

const subjects: [string, string][] = [
  [
    "Mathematics",
    "Algebra and functions, trigonometry, calculus, matrices, vectors and probability, taught as the language the physics is written in.",
  ],
  [
    "Physics",
    "Mechanics, fluids and heat, waves and optics, electricity and magnetism, then modern physics, relativity and quantum theory.",
  ],
  [
    "Chemistry",
    "Atomic structure, bonding, thermochemistry, kinetics and organic chemistry, as far as the physics needs it.",
  ],
  [
    "Scientific computing",
    "Enough programming to run the numbers: simulate an orbit, fit a curve, test an idea.",
  ],
  [
    "Astrophysics",
    "Stars and molecules, the universe, and a research chapter, reached once the foundations are in place.",
  ],
];

const steps: [string, string][] = [
  ["Recap", "A short reminder of what the last lesson left you with."],
  [
    "Predict",
    "Commit to an answer before the explanation. Being wrong first helps it stick.",
  ],
  ["Theory", "The full derivation, revealed one step at a time."],
  ["Worked example", "A solved problem to study before you try your own."],
  ["Practice", "Questions that adjust to how you are doing."],
  ["Review cards", "The ideas come back just before you would forget them."],
];

export function Home() {
  return (
    <main id="main" className="landing">
      <section className="l-hero">
        <div className="l-hero-copy">
          <p className="mono">Astrophysics, from the first question</p>
          <h1>
            Two views.
            <br />
            One distance.
          </h1>
          <p className="l-lede">
            Astronomers measure the sky by looking from two places and
            comparing. This course does the same with ideas: start with a
            question, look at it from the physics and from the mathematics, and
            keep what holds up.
          </p>
          <Link className="l-cta" to="/learn">
            Explore the course <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <figure className="l-plate">
          <div className="window-bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>parallax.plate</span>
          </div>
          <ParallaxPlate />
          <figcaption>
            <span className="mono">Fig. 1</span> A nearby star shifts against
            distant stars as Earth moves. Half the shift is the angle p, and the
            distance is d = 1 / p.
          </figcaption>
        </figure>
      </section>

      <section className="l-band" aria-labelledby="try-title">
        <div className="l-band-head">
          <h2 id="try-title">Try the idea</h2>
          <p>
            That is a whole lesson in miniature: a picture, one equation, and
            something to move.
          </p>
        </div>
        <ParallaxTry />
      </section>

      <section className="l-index" aria-labelledby="index-title">
        <h2 id="index-title">What you will study</h2>
        <dl>
          {subjects.map(([name, text]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="l-index l-steps" aria-labelledby="steps-title">
        <h2 id="steps-title">A lesson, in order</h2>
        <ol>
          {steps.map(([name, text]) => (
            <li key={name}>
              <strong>{name}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="l-close">
        <p>
          Full theory. Real questions. Draft lessons, openly marked as drafts
          until independent review.
        </p>
        <Link className="l-cta" to="/learn">
          Start with one question <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <p className="l-wordmark" aria-hidden="true">
          parallax
        </p>
      </section>
    </main>
  );
}
