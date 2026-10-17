import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { auth } from "../../lib/firebase";
import { Button } from "../ui/button";
export function TutorPanel({
  lessonId,
  sectionId,
  depth,
}: {
  lessonId: string;
  sectionId?: string;
  depth: "quick" | "full";
}) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
      [],
    ),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const endpoint = import.meta.env.VITE_TUTOR_URL as string | undefined;
  async function send(text: string) {
    if (!endpoint || busy || !text.trim()) return;
    setBusy(true);
    setError("");
    const previous = messages;
    setMessages((m) => [
      ...m,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    controller.current = new AbortController();
    try {
      const token = await auth.currentUser?.getIdToken();
      const result = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId,
          sectionId,
          depth,
          message: text,
          history: previous.slice(-10),
        }),
        signal: controller.current.signal,
      });
      if (!result.ok)
        throw Error(
          result.status === 429
            ? "Daily tutor limit reached. Come back tomorrow."
            : result.status === 503
              ? "Tutor is not available yet. Your lessons still work."
              : "Tutor could not connect. Please try later.",
        );
      if (!result.body) throw Error("No streamed response");
      const reader = result.body.getReader(),
        decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
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
          if (data.text)
            setMessages((m) =>
              m.map((message, index) =>
                index === m.length - 1
                  ? { ...message, content: message.content + data.text }
                  : message,
              ),
            );
        }
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Tutor is unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside className="tutor-panel">
      <p className="eyebrow">YOUR LESSON TUTOR</p>
      <h3>Ask a different question.</h3>
      {!endpoint && (
        <p className="info-box">
          Tutor integration is not activated. No AI request is sent. An eligible
          provider and deployed Worker are required.
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
      <div className="chat-messages" aria-live="polite">
        {messages.map((message, i) => (
          <article key={i} className={message.role}>
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
      {error && <p role="alert">{error}</p>}
    </aside>
  );
}
