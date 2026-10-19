import { useState, useEffect } from "react";
import { useLearning } from "../../hooks/useLearning";
import { auth } from "../../lib/firebase";
import { Button } from "../ui/button";
interface Session {
  attemptId: string;
  expiresAt: number;
  questions: { id: string; prompt: string; unit: string }[];
  answers?: Record<string, string>;
}
interface Receipt {
  id: string;
  lessonId: string;
  score: number;
  passed: boolean;
  correct: number;
  total: number;
}
export function TrustedAssessment({ lessonId }: { lessonId: string }) {
  const store = useLearning(),
    cached = store.records.lessons[lessonId]?.interaction;
  const endpoint = import.meta.env.VITE_ASSESSMENT_URL as string | undefined;
  const [requestId, setRequestId] = useState(
    () => cached?.assessmentRequestId || crypto.randomUUID(),
  );
  const [session, setSession] = useState<Session | null>(
      () => (cached?.serverAssessment as Session) || null,
    ),
    [answers, setAnswers] = useState<Record<string, string>>(
      () => (cached?.serverAssessment as Session)?.answers || {},
    ),
    [receipt, setReceipt] = useState<Receipt | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const supported = [
    "PB1.1",
    "PB1.2",
    "PB1.3",
    "PB1.4",
    "MB2.3",
    "AS1.3",
  ].includes(lessonId);
  async function request(path: string, body?: object, method = "POST") {
    setBusy(true);
    setError("");
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw Error("Sign in again to use server assessments.");
      const response = await fetch(`${endpoint!.replace(/\/$/, "")}/${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Assessment unavailable");
      return data;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Assessment unavailable",
      );
      return null;
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!endpoint || !supported) return;
    store.saveLessonInteraction(lessonId, { assessmentRequestId: requestId });
    void request("history", undefined, "GET").then((history) => {
      const found = Array.isArray(history)
        ? history.find(
            (item) =>
              item.lessonId === lessonId &&
              (!session || item.id === session.attemptId),
          )
        : null;
      if (found) setReceipt(found);
    });
  }, [endpoint, supported, lessonId]);
  if (!endpoint || !supported)
    return (
      <p className="source-note">
        This is local study progress. Server-graded assessments are{" "}
        {supported ? "not connected" : "not yet authored for this lesson"}.
      </p>
    );
  function restart() {
    const id = crypto.randomUUID();
    setRequestId(id);
    setReceipt(null);
    setSession(null);
    setAnswers({});
    store.saveLessonInteraction(lessonId, {
      assessmentRequestId: id,
      serverAssessment: null,
    });
  }
  return (
    <section className="settings-card">
      <h2>Server-graded practice</h2>
      <p>
        The server issues numerical questions and records its own result. This
        is not an independently certified or proctored assessment.
      </p>
      {receipt ? (
        <>
          <p role="status">
            Server result: {receipt.correct}/{receipt.total} ·{" "}
            {receipt.passed ? "Threshold reached" : "More practice recommended"}
            . Record {receipt.id}.
          </p>
          <Button variant="outline" onClick={restart}>
            Start another assessment
          </Button>
        </>
      ) : !session ? (
        <Button
          disabled={busy}
          onClick={async () => {
            const next = await request("start", { lessonId, requestId });
            if (next) {
              setSession(next);
              setAnswers({});
              store.saveLessonInteraction(lessonId, { serverAssessment: next });
            }
          }}
        >
          Start server assessment
        </Button>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const next = await request("submit", {
              attemptId: session.attemptId,
              answers,
            });
            if (next) setReceipt(next);
          }}
        >
          {session.questions.map((q) => (
            <label key={q.id} style={{ display: "block", margin: "16px 0" }}>
              {q.prompt} ({q.unit})
              <input
                required
                type="number"
                step="any"
                value={answers[q.id] || ""}
                onChange={(e) => {
                  const next = { ...answers, [q.id]: e.target.value };
                  setAnswers(next);
                  store.saveLessonInteraction(lessonId, {
                    serverAssessment: { ...session, answers: next },
                  });
                }}
              />
            </label>
          ))}
          <Button disabled={busy} type="submit">
            Submit to server
          </Button>
          {Date.now() > session.expiresAt && (
            <Button type="button" variant="outline" onClick={restart}>
              Discard expired attempt
            </Button>
          )}
        </form>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
