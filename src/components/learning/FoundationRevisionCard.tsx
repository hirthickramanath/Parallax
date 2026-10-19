import { Link } from "react-router-dom";
import { useLearning } from "../../hooks/useLearning";
import { course } from "../../lib/course";
import {
  FOUNDATION_ORDER,
  foundationRevised,
  nextFoundation,
} from "../../lib/foundation-path";
import { Button } from "../ui/button";
export function FoundationRevisionCard() {
  const store = useLearning(),
    active = !!store.preferences.foundationRevision,
    next = nextFoundation(store.records),
    done = FOUNDATION_ORDER.filter((id) =>
      foundationRevised(store.records, id),
    ).length;
  return (
    <section
      className="settings-card foundation-revision-card"
      aria-label="Foundation revision"
    >
      <p className="eyebrow">
        {active ? "REVISION COMES FIRST" : "KNOW IT, BUT IT’S BEEN A WHILE?"}
      </p>
      <h2>
        {active
          ? next
            ? `Rebuild: ${course.authored[next].title}`
            : "Your foundation revision is complete"
          : "Rebuild your foundations in depth."}
      </h2>
      <p>
        Revisit Class 11–12 maths, physics and supporting chemistry. Start with
        vocabulary, work through examples, retain the full theory, then
        practise. Your existing course progress stays intact.
      </p>
      {active && (
        <p>
          {done} of {FOUNDATION_ORDER.length} chapters revised · guided
          practice, not a certified assessment
        </p>
      )}
      <Button asChild>
        <Link
          to={
            active && next
              ? `/foundation-revision/${next}`
              : "/foundation-revision"
          }
        >
          {active ? "Continue revision" : "Start in-depth revision"}
        </Link>
      </Button>
    </section>
  );
}
