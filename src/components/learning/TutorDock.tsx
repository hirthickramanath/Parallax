import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MessageCircle, X } from "lucide-react";
import { course, nextLesson, journeyLessons } from "../../lib/course";
import { useLearning } from "../../hooks/useLearning";
import { TutorPanel } from "./TutorPanel";
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
export function TutorDockProvider({ children }: { children: ReactNode }) {
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
        className="tutor-launcher"
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
          <h2 id="tutor-dock-title">Your AI tutor</h2>
          <button
            autoFocus
            aria-label="Close AI tutor"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </header>
        {lesson ? (
          <p className="source-note">
            Helping with{" "}
            {course.authored[lesson.lessonId]?.title || lesson.lessonId}
          </p>
        ) : (
          <label className="tutor-topic">
            Study topic
            <select
              value={current.lessonId}
              onChange={(e) => setSelected(e.target.value)}
            >
              {journeyLessons
                .filter((l) => course.authored[l.id])
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} · {l.title}
                  </option>
                ))}
            </select>
          </label>
        )}
        <TutorPanel key={`${store.uid}:${current.lessonId}`} {...current} />
      </dialog>
    </Context.Provider>
  );
}
