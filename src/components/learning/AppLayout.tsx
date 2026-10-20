import { TutorDockProvider } from "./TutorDock";
import { BackgroundReminderSync } from "./BackgroundReminder";
import { ThemeSelect } from "../ThemeSelect";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import {
  Orbit,
  LayoutDashboard,
  Map,
  Flame,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLearning, useClock } from "../../hooks/useLearning";
import { dateKey, streakStats } from "../../lib/learning-core";
import { StudyReminder } from "./StudyReminder";
const links = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/learn", "Learn", Map],
  ["/stats", "Activity", Flame],
  ["/settings", "Settings", Settings],
] as const;
export function AppLayout() {
  const { user, logout } = useAuth(),
    store = useLearning(),
    now = useClock(),
    stats = streakStats(
      store.records.days,
      dateKey(now, store.preferences.timezone),
    );
  const pathname = useLocation().pathname;
  const focused =
    pathname.startsWith("/lesson/") ||
    pathname.startsWith("/foundation-revision/");
  if (focused)
    return (
      <TutorDockProvider>
        <div className="learning-app focused-study">
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <BackgroundReminderSync />
          <Outlet />
        </div>
      </TutorDockProvider>
    );
  return (
    <TutorDockProvider>
      <div className="learning-app">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <aside className="app-sidebar">
          <Link className="app-brand" to="/dashboard">
            <Orbit />
            parallax<span>✦</span>
          </Link>
          <nav aria-label="Study navigation">
            {links.map(([to, label, Icon]) => (
              <NavLink key={to} to={to}>
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-note">
              <span>THE UNIVERSE IS BIG.</span>
              <strong>Start with one question.</strong>
            </div>
            <button
              onClick={() =>
                void logout().catch(() =>
                  window.alert("Sign-out failed. Please retry."),
                )
              }
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>
        <div className="app-main">
          <header className="app-topbar">
            <span className="mobile-brand">parallax✦</span>
            <span className="sync-status" role="status">
              {store.storageError
                ? "Browser storage unavailable"
                : store.status}
            </span>
            <ThemeSelect />
            <div className="topbar-stats">
              <span>
                <Flame size={19} />
                {stats.current}
              </span>
              <span className="xp-badge">✦ {stats.totalXp} XP</span>
              <Link
                to="/settings"
                className="avatar"
                aria-label="Open settings"
              >
                {(user?.displayName || user?.email || "P")[0].toUpperCase()}
              </Link>
            </div>
          </header>
          <StudyReminder />
          <BackgroundReminderSync />
          <Outlet />
          <footer className="app-footer">
            Draft lessons · Full theory · Real questions
            <br />
            Your progress belongs to you.
          </footer>
        </div>
        <nav className="mobile-nav" aria-label="Mobile study navigation">
          {links
            .filter(([to]) =>
              ["/dashboard", "/learn", "/stats", "/settings"].includes(to),
            )
            .map(([to, label, Icon]) => (
              <NavLink key={to} to={to}>
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
        </nav>
      </div>
    </TutorDockProvider>
  );
}
