import {
  Children,
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import { Button } from "../ui/button";
export const SectionContext = createContext({
  activeId: "",
  onTheoryComplete: () => {},
});
function TheoryReveal({
  children,
  onComplete,
}: {
  children: ReactNode;
  onComplete: () => void;
}) {
  const blocks = Children.toArray(children);
  const [count, setCount] = useState(1);
  return (
    <>
      <div>{blocks.slice(0, count)}</div>
      <p className="source-note" role="status">
        {count} of {blocks.length} theory blocks shown. Each block retains the
        original derivation.
      </p>
      <div className="lab-actions">
        <Button
          disabled={count >= blocks.length}
          onClick={() => {
            const next = Math.min(blocks.length, count + 1);
            setCount(next);
            if (next === blocks.length) onComplete();
          }}
        >
          Reveal next theory step
        </Button>
        <Button
          variant="outline"
          disabled={count >= blocks.length}
          onClick={() => {
            setCount(blocks.length);
            onComplete();
          }}
        >
          Show full theory
        </Button>
      </div>
    </>
  );
}
export function StoredSection({
  id,
  title,
  layer,
  children,
}: {
  id: string;
  title: string;
  layer: string;
  children: ReactNode;
}) {
  const active = useContext(SectionContext);
  if (id !== active.activeId) return null;
  return (
    <section className="lesson-prose">
      <h2>{title}</h2>
      {layer === "theory" ? (
        <TheoryReveal onComplete={active.onTheoryComplete}>
          {children}
        </TheoryReveal>
      ) : (
        children
      )}
    </section>
  );
}
export function SymbolDefinition({
  name,
  definition,
}: {
  name: string;
  definition: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="symbol-definition">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {name}
      </button>
      {open && (
        <span id={id} role="note">
          {definition}
        </span>
      )}
    </span>
  );
}
