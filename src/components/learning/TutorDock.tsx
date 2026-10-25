import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { course, nextLesson, journeyLessons } from "../../lib/course";
import { useLearning } from "../../hooks/useLearning";
import { TutorPanel } from "./TutorPanel";
const trackNames: [string, string][] = [
  ["maths", "Maths"],
  ["physics", "Physics"],
  ["chemistry", "Chemistry"],
  ["computing", "Computing"],
  ["astro", "Astrophysics"],
];
const trackGroups = trackNames
  .map(([track, label]) => {
    const items = journeyLessons.filter(
      (l) => l.track === track && course.authored[l.id],
    );
    return [track, label, items] as const;
  })
  .filter(([, , items]) => items.length);
type LessonContext = {
  lessonId: string;
  sectionId?: string;
  depth: "quick" | "full";
  revisionStep?: number;
};
const Context = createContext<{
  isOpen: boolean;
  toggle: () => void;
  setLesson: (value: LessonContext | null) => void;
} | null>(null);
export function useTutorDock() {
  const value = useContext(Context);
  if (!value) throw Error("Tutor requires the study layout");
  return value;
}
export function useTutorLesson(
  lessonId: string,
  sectionId: string,
  depth: "quick" | "full",
  revisionStep?: number,
) {
  const { setLesson } = useTutorDock();
  useEffect(() => {
    setLesson({ lessonId, sectionId, depth, revisionStep });
    return () => setLesson(null);
  }, [lessonId, sectionId, depth, revisionStep, setLesson]);
}
export function TutorDockProvider({
  children,
  focused = false,
}: {
  children: ReactNode;
  /** Lesson pages carry their own tutor button, so the floating one steps aside on phones. */
  focused?: boolean;
}) {
  const store = useLearning();
  const [isOpen, setOpen] = useState(false),
    [lesson, setLesson] = useState<LessonContext | null>(null),
    [selected, setSelected] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const fallback = nextLesson(store.records)?.id || journeyLessons[0].id;
  const current = lesson || {
    lessonId: selected || fallback,
    depth: store.preferences.depth,
  };
  useEffect(() => {
    if (isOpen && !dialog.current?.open) dialog.current?.showModal();
    if (!isOpen && dialog.current?.open) dialog.current?.close();
  }, [isOpen]);
  return (
    <Context.Provider
      value={{ isOpen, toggle: () => setOpen((v) => !v), setLesson }}
    >
      {children}
      <button
        className={`tutor-launcher${focused ? " tutor-launcher-focused" : ""}`}
        aria-label="Open AI tutor"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setOpen(true)}
      >
        <MessageCircle size={22} />
        <span>AI tutor</span>
      </button>
      <dialog
        ref={dialog}
        className="tutor-dock"
        aria-labelledby="tutor-dock-title"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
      >
        <header className="tutor-dock-header">
          <span className="chat-mark" aria-hidden="true">
            <Sparkles size={16} />
          </span>
          <div className="chat-title">
            <h2 id="tutor-dock-title">AI tutor</h2>
            <p>
              {lesson
                ? `Helping with ${course.authored[lesson.lessonId]?.title || lesson.lessonId}`
                : course.authored[current.lessonId]?.title || ""}
            </p>
          </div>
          {lesson ? (
            <span className="topic-chip" title="Lesson for this chat">
              {lesson.lessonId}
            </span>
          ) : (
            <label className="topic-picker">
              <span className="visually-hidden">Study topic</span>
              <select
                value={current.lessonId}
                onChange={(e) => setSelected(e.target.value)}
              >
                {trackGroups.map(([track, label, items]) => (
                  <optgroup key={track} label={label}>
                    {items.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.id}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          )}
          <button
            autoFocus
            className="chat-close"
            aria-label="Close AI tutor"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </header>
        <TutorPanel key={`${store.uid}:${current.lessonId}`} {...current} />
      </dialog>
    </Context.Provider>
  );
}
