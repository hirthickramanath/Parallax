import { useServices } from "../../lib/services";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { auth } from "../../lib/firebase";
import { useConversation } from "../../hooks/useConversation";
import { Button } from "../ui/button";
export function TutorPanel({
  lessonId,
  sectionId,
  depth,
  revisionStep,
}: {
  lessonId: string;
  sectionId?: string;
  depth: "quick" | "full";
  revisionStep?: number;
}) {
  const chat = useConversation(lessonId);
  const [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [remaining, setRemaining] = useState<number | null>(null);
  const controller = useRef<AbortController | null>(null),
    sending = useRef(false);
  const { tutorUrl: endpoint } = useServices();
  useEffect(() => () => controller.current?.abort(), []);
  async function send(text: string) {
    if (!endpoint || sending.current || !text.trim()) return;
    sending.current = true;
    setBusy(true);
    setError("");
    const previous = chat.messages;
    chat.append("user", text);
    const replyId = chat.append("assistant", "");
    setInput("");
    controller.current = new AbortController();
    let reply = "";
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw Error("Sign in again before asking the tutor.");
      const result = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId,
          sectionId,
          revisionStep,
          depth,
          conversationId: chat.id,
          message: text,
          history: previous
            .filter((m) => m.content)
            .slice(-10)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: AbortSignal.any([
          controller.current.signal,
          AbortSignal.timeout(60000),
        ]),
      });
      const allowance = result.headers.get("X-Tutor-Remaining");
      if (allowance !== null && Number.isFinite(Number(allowance)))
        setRemaining(Number(allowance));
      if (!result.ok)
        throw Error(
          result.status === 429
            ? "Daily tutor limit reached. Come back tomorrow."
            : result.status === 503
              ? "Tutor resting. Please try later."
              : "Tutor could not connect. Please try later.",
        );
      if (!result.body) throw Error("No streamed response");
      const reader = result.body.getReader(),
        decoder = new TextDecoder();
      let buffer = "";
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder
            .decode(value, { stream: true })
            .replace(/\r\n/g, "\n");
          if (buffer.length > 100000)
            throw Error("Tutor reply exceeded the message limit.");
          let split;
          while ((split = buffer.indexOf("\n\n")) >= 0) {
            const event = buffer.slice(0, split);
            buffer = buffer.slice(split + 2);
            if (!event.startsWith("data: ")) continue;
            const data = JSON.parse(event.slice(6)) as {
              text?: string;
              error?: string;
            };
            if (data.error) throw Error(data.error);
            if (data.text) {
              reply += data.text;
              if (reply.length > 20000)
                throw Error("Tutor reply exceeded the message limit.");
              chat.replace(replyId, reply);
            }
          }
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
      if (!reply.trim())
        throw Error("No tutor explanation was received. Please try again.");
    } catch (cause) {
      const stopped = controller.current?.signal.aborted;
      setError(
        stopped
          ? "Reply stopped. The text received so far is saved."
          : cause instanceof DOMException && cause.name === "TimeoutError"
            ? "Tutor timed out. Partial text is saved."
            : cause instanceof Error
              ? cause.message
              : "Tutor is unavailable.",
      );
      if (!reply)
        chat.replace(
          replyId,
          stopped
            ? "[Reply stopped before any text arrived.]"
            : "[No reply was received. Retry when the tutor is available.]",
        );
    } finally {
      sending.current = false;
      setBusy(false);
      void chat.flush();
    }
  }
  return (
    <aside className="tutor-panel" aria-label="AI lesson tutor">
      <p className="eyebrow">YOUR LESSON TUTOR</p>
      <h3>Ask a different question.</h3>
      {!endpoint && (
        <p className="info-box">
          The AI tutor is awaiting connection. You can keep studying with the
          worked examples and hints. Saved conversations remain available.
        </p>
      )}
      {remaining !== null && (
        <p className="source-note" role="status">
          {remaining} requests remaining today · resets at 00:00 UTC.
        </p>
      )}
      <div className="tutor-actions">
        {[
          "Explain differently",
          "I’m stuck on this step",
          "Why does this work?",
          "Give me a practice problem",
          "Check my answer",
        ].map((action) => (
          <button
            key={action}
            disabled={!endpoint || busy}
            onClick={() => void send(action)}
          >
            {action}
          </button>
        ))}
      </div>
      <p className="source-note">
        AI explanations can make mistakes. Check reasoning, units and
        assumptions against the lesson. Conversations are saved to your account;
        don’t include private information.
      </p>
      <div className="chat-messages" aria-live="polite">
        {chat.messages.slice(-100).map((message) => (
          <article key={message.id} className={message.role}>
            <strong>{message.role === "user" ? "You" : "Tutor"}</strong>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          </article>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <label htmlFor="tutor-question">Ask about this section</label>
        <textarea
          id="tutor-question"
          value={input}
          maxLength={2000}
          onChange={(e) => setInput(e.target.value)}
          disabled={!endpoint || busy}
        />
        <Button disabled={!endpoint || busy || !input.trim()}>Ask tutor</Button>
        {busy && (
          <button
            type="button"
            className="text-button"
            onClick={() => controller.current?.abort()}
          >
            Stop reply
          </button>
        )}
      </form>
      <p className="source-note" role="status">
        {chat.status}
      </p>
      {error && <p role="alert">{error}</p>}
    </aside>
  );
}
