import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AppearanceToggles, AppearanceSync } from "./components/ThemeSelect";
import { Entry } from "./pages/Entry";
import { AuthProvider } from "./hooks/useAuth";
import { LearningProvider } from "./hooks/useLearning";
import { AccountMenu } from "./components/AccountMenu";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import "@fontsource-variable/literata/wght.css";
import "@fontsource-variable/literata/wght-italic.css";
import "@fontsource-variable/ibm-plex-sans/wght.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./index.css";
import "./styles/textbook.css";
import "./styles/layout.css";
import "./styles/public.css";
import "./styles/lesson.css";
import "./styles/glass.css";
const AppLayout = lazy(() =>
  import("./components/learning/AppLayout").then((m) => ({
    default: m.AppLayout,
  })),
);
const Projects = lazy(() =>
  import("./pages/Projects").then((m) => ({ default: m.Projects })),
);
const Author = lazy(() =>
  import("./pages/Author").then((m) => ({ default: m.Author })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Learn = lazy(() =>
  import("./pages/Learn").then((m) => ({ default: m.Learn })),
);
const Review = lazy(() =>
  import("./pages/Review").then((m) => ({ default: m.Review })),
);
const Revise = lazy(() =>
  import("./pages/Revise").then((m) => ({ default: m.Revise })),
);
const Stats = lazy(() =>
  import("./pages/Stats").then((m) => ({ default: m.Stats })),
);
const LearnerPilot = lazy(() =>
  import("./pages/LearnerPilot").then((m) => ({ default: m.LearnerPilot })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.Settings })),
);
const FoundationRevision = lazy(() =>
  import("./pages/FoundationRevision").then((m) => ({
    default: m.FoundationRevision,
  })),
);
const RevisionPlan = lazy(() =>
  import("./pages/RevisionPlan").then((m) => ({ default: m.RevisionPlan })),
);
const WeeklyPlan = lazy(() =>
  import("./pages/WeeklyPlan").then((m) => ({ default: m.WeeklyPlan })),
);
const LessonPlayer = lazy(() =>
  import("./pages/LessonPlayer").then((m) => ({ default: m.LessonPlayer })),
);
const Placement = lazy(() =>
  import("./pages/Placement").then((m) => ({ default: m.Placement })),
);
const TeachingLab = lazy(() =>
  import("./pages/TeachingLab").then((m) => ({ default: m.TeachingLab })),
);
function PublicLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="pub-header">
        <Link to="/" className="pub-brand">
          parallax
        </Link>
        <div className="pub-actions">
          <AppearanceToggles />
          <AccountMenu />
        </div>
      </header>
      <Outlet />
      <footer className="pub-footer">
        <span>Look closer. Think deeper.</span>
      </footer>
    </>
  );
}
function App() {
  return (
    <Suspense
      fallback={
        <main className="workspace-page" role="status">
          Opening your observatory…
        </main>
      }
    >
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Entry />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <LearningProvider>
                <AppLayout />
              </LearningProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/labs" element={<Navigate to="/dashboard" replace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/review" element={<Review />} />
          <Route path="/revise" element={<Revise />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/author" element={<Author />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/learner-pilot" element={<LearnerPilot />} />
          <Route path="/plan" element={<WeeklyPlan />} />
          <Route path="/revision-plan" element={<RevisionPlan />} />
          <Route path="/foundation-revision" element={<FoundationRevision />} />
          <Route
            path="/foundation-revision/:id"
            element={<FoundationRevision />}
          />
          <Route path="/placement" element={<Placement />} />
          <Route path="/lesson/:id" element={<LessonPlayer />} />
          <Route path="/teaching-lab" element={<TeachingLab />} />
        </Route>
        <Route
          path="*"
          element={
            <main id="main" className="workspace-page">
              <h1>Off the map.</h1>
              <Link to="/">Return home</Link>
            </main>
          }
        />
      </Routes>
    </Suspense>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppearanceSync />
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
// Cache visited static assets only. Firebase/API responses and user records never enter this cache.
if ("serviceWorker" in navigator && import.meta.env.PROD)
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* Local saving still works if offline-page caching is unavailable. */
    });
  });
