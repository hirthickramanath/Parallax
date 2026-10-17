import { useState } from "react";
import { Button } from "../ui/button";
import { MathText } from "./MathText";
export interface DerivationStep {
  equation: string;
  why: string;
}
export function Derivation({ steps }: { steps: DerivationStep[] }) {
  const [visible, setVisible] = useState(1);
  return (
    <section className="derivation" aria-label="Full derivation">
      <p className="eyebrow">THE ARGUMENT, WITHOUT SHORTCUTS</p>
      <ol>
        {steps.slice(0, visible).map((step, index) => (
          <li key={index}>
            <MathText display>{step.equation}</MathText>
            <p>
              <strong>Why this step:</strong> {step.why}
            </p>
          </li>
        ))}
      </ol>
      <p role="status">
        {visible} of {steps.length} steps shown.
      </p>
      <div className="lab-actions">
        <Button
          onClick={() =>
            setVisible((count) => Math.min(count + 1, steps.length))
          }
          disabled={visible === steps.length}
        >
          Reveal next step
        </Button>
        <Button
          variant="outline"
          onClick={() => setVisible(steps.length)}
          disabled={visible === steps.length}
        >
          Show full argument
        </Button>
      </div>
    </section>
  );
}
