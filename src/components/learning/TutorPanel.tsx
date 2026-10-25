import { loadServices, useServices } from "../../lib/services";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { auth } from "../../lib/firebase";
import { useConversation } from "../../hooks/useConversation";
import { ArrowUp, Sparkles, Square } from "lucide-react";
import { course } from "../../lib/course";
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
    [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null),
    sending = useRef(false);
  const { tutorUrl: endpoint, error: connectionError } = useServices();
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
          AbortSignal.timeout(90000),
        ]),
      });
      if (!result.ok) {
        const detail = (await result.json().catch(() => null)) as {
          error?: unknown;
          code?: unknown;
        } | null;
        const specific =
          (result.status === 503 ||
            (result.status === 429 && detail?.code === "rate_limited")) &&
          typeof detail?.code === "string" &&
          typeof detail.error === "string"
            ? detail.error.slice(0, 400)
            : "";
        throw Error(
          specific ||
            (result.status === 429
              ? "The AI provider is busy. Please try again shortly."
              : result.status === 503
                ? "The AI service is temporarily unavailable. Please try again shortly."
                : "Tutor could not connect. Please try later."),
        );
      }
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
  const log = useRef<HTMLDivElement>(null),
    field = useRef<HTMLTextAreaElement>(null);
  const messages = chat.messages.slice(-100);
  const last = messages.at(-1)?.content;
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, last]);
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);
  const title = course.authored[lessonId]?.title || lessonId;
  return (
    <aside className="chat" aria-label="AI lesson tutor">
      <div className="chat-log" ref={log} role="log" aria-live="polite">
        {!endpoint && (
          <p className="chat-note">
            The AI tutor is awaiting connection. You can keep studying with the
            worked examples and hints. Saved conversations remain available.
          </p>
        )}
        {messages.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-mark chat-mark-large" aria-hidden="true">
              <Sparkles size={22} />
            </span>
            <p className="chat-empty-title">What would you like to work on?</p>
            <p className="chat-empty-sub">
              {lessonId} · {title}
            </p>
            <div className="chat-starters">
              {[
                "Explain differently",
                "I’m stuck on this step",
                "Why does this work?",
                "Give me a practice problem",
                "Check my answer",
              ].map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={!endpoint || busy}
                  onClick={() => void send(action)}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`msg ${message.role}`}>
              <span className="visually-hidden">
                {message.role === "user" ? "You" : "Tutor"}
              </span>
              {message.role === "assistant" && (
                <span className="chat-mark" aria-hidden="true">
                  <Sparkles size={14} />
                </span>
              )}
              <div className="msg-body">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </article>
          ))
        )}
      </div>
      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
      {connectionError && (
        <p className="chat-note" role="status">
          Could not refresh the connection. You can still try the tutor or
          reconnect below.
        </p>
      )}
      {(!endpoint || error || connectionError) && (
        <button
          type="button"
          className="chat-retry"
          onClick={() => {
            void loadServices(true);
            setError("");
          }}
        >
          Retry tutor connection
        </button>
      )}
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <label htmlFor="tutor-question" className="visually-hidden">
          Ask about this section
        </label>
        <textarea
          id="tutor-question"
          ref={field}
          rows={1}
          value={input}
          maxLength={2000}
          placeholder="Ask about this section…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              void send(input);
            }
          }}
          disabled={!endpoint || busy}
        />
        {busy ? (
          <button
            type="button"
            className="composer-send"
            aria-label="Stop reply"
            onClick={() => controller.current?.abort()}
          >
            <Square size={14} fill="currentColor" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            className="composer-send"
            aria-label="Ask tutor"
            disabled={!endpoint || !input.trim()}
          >
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        )}
      </form>
      <p className="chat-foot">
        AI can make mistakes. Check reasoning, units and assumptions against the
        lesson. Chats are saved to your account; don’t include private
        information.
        <span className="visually-hidden" role="status">
          {chat.status}
        </span>
      </p>
    </aside>
  );
}
