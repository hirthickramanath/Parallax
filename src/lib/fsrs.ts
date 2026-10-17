import { fsrs, generatorParameters, Rating, type Card } from "ts-fsrs";
export { Rating };
export function restoreCard(card: Card): Card {
  return {
    ...card,
    due: new Date(card.due),
    ...(card.last_review ? { last_review: new Date(card.last_review) } : {}),
  };
}
export function schedule(
  card: Card,
  rating: Rating,
  retention: number,
  now = new Date(),
) {
  return fsrs(
    generatorParameters({ request_retention: retention, enable_fuzz: false }),
  ).next(restoreCard(card), now, rating as 1 | 2 | 3 | 4);
}
