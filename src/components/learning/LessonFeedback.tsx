import { useState } from "react";
import { useLearning } from "../../hooks/useLearning";
import { Button } from "../ui/button";
export function LessonFeedback({ lessonId }: { lessonId: string }) {
  const store = useLearning(),
    [sent, setSent] = useState(false);
  return (
    <details className="settings-card">
      <summary>How did this lesson feel? (optional)</summary>
      <p>
        Your response is saved with your study progress. It helps distinguish
        question difficulty from confusing explanations; it does not
        automatically change your mastery.
      </p>
      {sent ? (
        <p role="status">Feedback saved. Thank you.</p>
      ) : (
        <div className="rating-buttons">
          {[
            "Too easy",
            "A useful challenge",
            "Too difficult",
            "Explanation was unclear",
          ].map((label) => (
            <Button
              key={label}
              variant="outline"
              onClick={() => {
                store.put(
                  "plan",
                  `feedback-${lessonId}-${new Date().toISOString().slice(0, 10)}`,
                  { lessonId, label, updatedAt: Date.now() },
                );
                setSent(true);
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </details>
  );
}
