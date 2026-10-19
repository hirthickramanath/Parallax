import { useState } from "react";
import { useLearning } from "../../hooks/useLearning";
import { Rating, schedule } from "../../lib/fsrs";
import { dateKey } from "../../lib/learning-core";
import { Button } from "../ui/button";
export function LessonRecap({ lessonId }: { lessonId: string }) {
  const store = useLearning();
  const [seen, setSeen] = useState<string[]>([]),
    [shown, setShown] = useState(false),
    [dismissed, setDismissed] = useState(false);
  const newToday = Object.values(store.records.reviewLog).filter(
    (log) =>
      log.state === 0 &&
      dateKey(
        Date.parse(String(log.reviewedAt)),
        store.preferences.timezone,
      ) === dateKey(Date.now(), store.preferences.timezone),
  ).length;
  const current = Object.entries(store.records.reviewCards)
    .filter(
      ([id, c]) =>
        c.lessonId !== lessonId &&
        !seen.includes(id) &&
        new Date(c.fsrs.due).getTime() <= Date.now() &&
        (c.fsrs.state !== 0 || newToday < store.preferences.newCards),
    )
    .sort(
      (a, b) =>
        new Date(a[1].fsrs.due).getTime() - new Date(b[1].fsrs.due).getTime(),
    )[0];
  if (dismissed || seen.length >= 2 || !current) return null;
  const [id, card] = current;
  return (
    <section className="lesson-recap" aria-label="Between-lesson recall">
      <span className="pill">A QUICK RETURN · {card.lessonId}</span>
      <h3>{card.front}</h3>
      <p>
        Before the next idea, retrieve one you met earlier. {seen.length + 1} of
        up to 2.
      </p>
      {shown ? (
        <>
          <p>{card.back}</p>
          <p>How well did you recall it?</p>
          <div className="rating-buttons">
            {[Rating.Again, Rating.Hard, Rating.Good, Rating.Easy].map((r) => (
              <Button
                key={r}
                variant="outline"
                onClick={() => {
                  const result = schedule(
                    card.fsrs,
                    r,
                    store.preferences.retention,
                  );
                  store.put("reviewCards", id, { ...card, fsrs: result.card });
                  store.put("reviewLog", crypto.randomUUID(), {
                    cardId: id,
                    rating: Rating[r],
                    state: card.fsrs.state,
                    reviewedAt: new Date().toISOString(),
                    due: result.card.due.toISOString(),
                    elapsed_days: result.log.elapsed_days,
                  });
                  store.award(`review:${id}:${result.card.reps}`, 2, "review");
                  setSeen([...seen, id]);
                  setShown(false);
                }}
              >
                {Rating[r]}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <Button onClick={() => setShown(true)}>Recall, then reveal</Button>
      )}{" "}
      <Button variant="outline" onClick={() => setDismissed(true)}>
        Continue with this lesson
      </Button>
    </section>
  );
}
