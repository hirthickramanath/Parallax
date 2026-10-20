import { useState } from "react";
import { Link } from "react-router-dom";
import bank from "../../content/evaluation/foundation-pilot.json";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import {
  pilotAnswer,
  pilotNext,
  readPilot,
  type PilotRecord,
} from "../lib/learner-pilot";
export function LearnerPilot() {
  const { user } = useAuth();
  return user ? (
    <Pilot key={user.uid} storageKey={`parallax-pilot-v1:${user.uid}`} />
  ) : null;
}
function Pilot({ storageKey }: { storageKey: string }) {
  const [record, setRecord] = useState<PilotRecord | null>(() => {
    try {
      return readPilot(localStorage.getItem(storageKey));
    } catch {
      return null;
    }
  });
  const [consent, setConsent] = useState(false),
    [studied, setStudied] = useState(false);
  const [prior, setPrior] = useState<PilotRecord["priorKnowledge"]>("some");
  const [assistance, setAssistance] = useState(""),
    [helpUsed, setHelpUsed] = useState("");
  const [source, setSource] = useState("app"),
    [feedback, setFeedback] = useState("");
  const [answers, setAnswers] = useState<
    Record<string, { value: string; reasoning: string }>
  >({});
  const [error, setError] = useState("");
  const next = pilotNext(record),
    complete = !!record?.delayed;
  function save(value: PilotRecord | null) {
    try {
      if (value) localStorage.setItem(storageKey, JSON.stringify(value));
      else localStorage.removeItem(storageKey);
      setRecord(value);
      setError("");
      return true;
    } catch {
      setError(
        "This browser could not save the pilot. Your current answers remain here; allow local storage before submitting.",
      );
      return false;
    }
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !consent ||
      !next.available ||
      complete ||
      !assistance ||
      (next.stage === "immediate" && !studied)
    )
      return;
    try {
      const responses = Object.fromEntries(
        bank.forms[next.stage].map((q) => [
          q.id,
          {
            value: pilotAnswer(answers[q.id]?.value || ""),
            reasoning: answers[q.id]?.reasoning.trim() || "I do not know yet.",
          },
        ]),
      );
      const value: PilotRecord = {
        ...(record || {
          studyCode: `learner-${crypto.randomUUID().slice(0, 12)}`,
          priorKnowledge: prior,
          consentedAt: new Date().toISOString(),
          version: bank.version,
        }),
        [next.stage]: {
          completedAt: new Date().toISOString(),
          assisted: assistance === "yes",
          helpUsed,
          instructionSource:
            next.stage === "baseline" ? "before-study" : source,
          feedback,
          responses,
        },
      };
      if (save(value)) {
        setAnswers({});
        setAssistance("");
        setHelpUsed("");
        setFeedback("");
        setStudied(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check your answers.");
    }
  }
  function exportRecord() {
    if (!record) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify([record], null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "parallax-learner-pilot.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">VOLUNTARY LEARNER PILOT</p>
      <h1>Help us understand how you learn.</h1>
      <p>
        This short pilot covers fluids, heat, orbits and planes. It is not an
        exam or proof that the course works. There is no timer, XP reward or
        effect on your lesson progress. Skipping an answer is useful evidence.
      </p>
      <section className="settings-card">
        <h2>Your choice, your data</h2>
        <p>
          Answers stay in this browser for this account. They are not
          automatically sent to us or synced between devices. Use Export to
          share voluntarily with a reviewer; it contains a random study code,
          answers and dates, without your account name or email. Avoid putting
          personal details in free text. You can leave or erase this record at
          any time.
        </p>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          I choose to take part and understand what is saved.
        </label>
        {record && (
          <>
            <p>
              Study code: {record.studyCode}. Completed:{" "}
              {["baseline", "immediate", "delayed"]
                .filter((s) => !!record[s as "baseline"])
                .join(", ")}
              .
            </p>
            <Button onClick={exportRecord}>Export pilot answers</Button>{" "}
            <Button
              variant="outline"
              onClick={() => {
                if (
                  window.confirm(
                    "Erase this browser’s pilot record? Export first if you want a copy.",
                  )
                ) {
                  if (save(null)) {
                    setAnswers({});
                    setConsent(false);
                  }
                }
              }}
            >
              Erase pilot record
            </Button>
          </>
        )}
      </section>
      {error && <p role="alert">{error}</p>}
      {complete ? (
        <section className="settings-card">
          <h2>Pilot complete</h2>
          <p>
            Thank you. Export your answers if you want them reviewed. Numerical
            scoring can be prepared from the export; reasoning still needs human
            review. No effectiveness claim is made from one participant.
          </p>
        </section>
      ) : !next.available ? (
        <section className="settings-card">
          <h2>Let the learning settle</h2>
          <p>
            Your delayed check opens {new Date(next.dueAt!).toLocaleString()}.
            It is at least six days after your immediate check. Continue
            ordinary study; record any revision or other help when you return.
          </p>
        </section>
      ) : (
        <form key={next.stage} onSubmit={submit} className="settings-card">
          <h2>
            {next.stage === "baseline"
              ? "1. Before studying"
              : next.stage === "immediate"
                ? "2. After studying"
                : "3. Delayed check"}
          </h2>
          <p>
            Give your own answer and a brief reason. For an unassisted attempt,
            do not use the tutor, notes or an answer key. If you have seen these
            questions in chat, or use any help, mark that below. Submitted
            stages are kept unchanged for comparison.
          </p>
          {!record && (
            <label>
              Prior knowledge{" "}
              <select
                value={prior}
                onChange={(e) => setPrior(e.target.value as typeof prior)}
              >
                <option value="new">New to these topics</option>
                <option value="some">Some knowledge; revision needed</option>
                <option value="experienced">Experienced</option>
              </select>
            </label>
          )}
          {next.stage === "immediate" && (
            <>
              <p>
                Study the four linked revision chapters before this check:{" "}
                <Link to="/foundation-revision/PB2.1">Fluids</Link>,{" "}
                <Link to="/foundation-revision/PB2.2">Thermodynamics</Link>,{" "}
                <Link to="/foundation-revision/MB2.2">Conics</Link> and{" "}
                <Link to="/foundation-revision/MB2.3">Planes</Link>. Your saved
                baseline will remain here when you return.
              </p>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={studied}
                  onChange={(e) => setStudied(e.target.checked)}
                />
                I have studied these topics after the baseline.
              </label>
            </>
          )}
          {bank.forms[next.stage].map((q, i) => (
            <fieldset key={q.id}>
              <legend>
                {i + 1}. {q.prompt}
              </legend>
              <label>
                Answer ({q.unit}; leave blank if unsure)
                <input
                  inputMode="decimal"
                  value={answers[q.id]?.value || ""}
                  maxLength={40}
                  onChange={(e) =>
                    setAnswers((a) => ({
                      ...a,
                      [q.id]: {
                        reasoning: a[q.id]?.reasoning || "",
                        value: e.target.value,
                      },
                    }))
                  }
                />
              </label>
              <label>
                Your reasoning
                <textarea
                  maxLength={2000}
                  value={answers[q.id]?.reasoning || ""}
                  onChange={(e) =>
                    setAnswers((a) => ({
                      ...a,
                      [q.id]: {
                        value: a[q.id]?.value || "",
                        reasoning: e.target.value,
                      },
                    }))
                  }
                />
              </label>
            </fieldset>
          ))}
          <label>
            Did you use help or previously see these questions?
            <select
              required
              value={assistance}
              onChange={(e) => setAssistance(e.target.value)}
            >
              <option value="">Choose an answer</option>
              <option value="no">No, unassisted</option>
              <option value="yes">Yes, help or prior exposure</option>
            </select>
          </label>
          <label>
            What help or prior exposure?{" "}
            <input
              value={helpUsed}
              maxLength={1000}
              onChange={(e) => setHelpUsed(e.target.value)}
            />
          </label>
          {next.stage !== "baseline" && (
            <label>
              Where did you study?
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="app">Parallax lessons</option>
                <option value="chat">Chat explanation</option>
                <option value="both">Both</option>
                <option value="other">Other (describe above)</option>
              </select>
            </label>
          )}
          <label>
            What felt confusing, too easy or too hard?
            <textarea
              value={feedback}
              maxLength={2000}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </label>
          <Button
            type="submit"
            disabled={
              !consent ||
              !assistance ||
              (next.stage === "immediate" && !studied)
            }
          >
            Save this check
          </Button>
        </form>
      )}
      <Link to="/settings">Back to settings</Link>
    </main>
  );
}
