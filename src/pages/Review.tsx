import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Rating, schedule } from "../lib/fsrs";
import { useLearning } from "../hooks/useLearning";
import { dateKey } from "../lib/learning-core";
import { Button } from "../components/ui/button";
export function Review() {
  const store = useLearning();
  const [shown, setShown] = useState(false),
    [count, setCount] = useState(0),
    [seen, setSeen] = useState<string[]>([]);
  const now = Date.now();
  const due = Object.entries(store.records.reviewCards)
    .filter(
      ([id, c]) => new Date(c.fsrs.due).getTime() <= now && !seen.includes(id),
    )
    .sort(
      (a, b) =>
        new Date(a[1].fsrs.due).getTime() - new Date(b[1].fsrs.due).getTime(),
    );
  const newToday = Object.values(store.records.reviewLog).filter(
    (log) =>
      dateKey(
        Date.parse(String(log.reviewedAt)),
        store.preferences.timezone,
      ) === dateKey(now, store.preferences.timezone) && Number(log.state) === 0,
  ).length;
  const current = due.find(
    ([, c]) => c.fsrs.state !== 0 || newToday < store.preferences.newCards,
  );
  useEffect(() => {
    if (count > 0 && (!current || count >= 30))
      store.award(
        `review-session:${dateKey(Date.now(), store.preferences.timezone)}`,
        10,
        "review",
      );
  }, [count, !!current]);
  const rate = (rating: Rating) => {
    if (!current || !shown) return;
    const [id, card] = current;
    const result = schedule(card.fsrs, rating, store.preferences.retention);
    store.put("reviewCards", id, { ...card, fsrs: result.card });
    const logId = crypto.randomUUID();
    store.put("reviewLog", logId, {
      cardId: id,
      rating: Rating[rating],
      state: card.fsrs.state,
      due: result.card.due.toISOString(),
      reviewedAt: new Date().toISOString(),
      elapsed_days: result.log.elapsed_days,
    });
    store.award(`review:${id}:${result.card.reps}`, 2, "review");
    setSeen((s) => [...s, id]);
    setCount((n) => n + 1);
    setShown(false);
  };
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">RETRIEVE, DON’T JUST REREAD</p>
      <h1>Make it stick.</h1>
      <p className="page-description">
        FSRS schedules your next encounter. Explain the idea before revealing
        the answer. Up to 30 cards per catch-up session.
      </p>
      {current && count < 30 ? (
        <section className="review-card">
          <span className="pill">
            {current[1].lessonId} · {due.length} DUE · {count} REVIEWED
          </span>
          <h2>{current[1].front}</h2>
          {shown ? (
            <>
              <div className="review-answer">{current[1].back}</div>
              <p>How well did you recall it?</p>
              <div className="rating-buttons">
                {[Rating.Again, Rating.Hard, Rating.Good, Rating.Easy].map(
                  (r) => (
                    <Button key={r} variant="outline" onClick={() => rate(r)}>
                      {Rating[r]}
                    </Button>
                  ),
                )}
              </div>
            </>
          ) : (
            <Button onClick={() => setShown(true)}>Reveal answer</Button>
          )}
        </section>
      ) : (
        <section className="empty-card">
          <h2>{count ? "Session complete." : "Your mind has room to grow."}</h2>
          <p>
            {count
              ? `${count} cards reviewed. Remaining cards keep their due dates; return for another short session.`
              : "Complete a draft lesson to create its authored review cards, or return when cards are due."}
          </p>
          {count > 0 && (
            <Button
              onClick={() => {
                setCount(0);
                setSeen([]);
              }}
            >
              Start another short session
            </Button>
          )}
          <Link className="text-button" to="/learn">
            Explore lessons
          </Link>
        </section>
      )}
      <p className="info-box">
        Review cards are authored from the lessons, not generated live. The
        memory model estimates recall; it does not measure your brain directly.
      </p>
    </main>
  );
}
