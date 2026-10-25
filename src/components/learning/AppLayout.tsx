import { TutorDockProvider } from "./TutorDock";
import { BackgroundReminderSync } from "./BackgroundReminder";
import { AppearanceToggles } from "../ThemeSelect";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import {
  CalendarCheck,
  Map,
  Layers,
  Activity,
  Flame,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLearning, useClock } from "../../hooks/useLearning";
import { dateKey, streakStats } from "../../lib/learning-core";
import { StudyReminder } from "./StudyReminder";
const links = [
  ["/dashboard", "Today", CalendarCheck],
  ["/learn", "Course", Map],
  ["/review", "Review", Layers],
  ["/stats", "Activity", Activity],
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
      <div className="learning-app shell">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <div className="site-header-inner">
            <Link className="site-brand" to="/dashboard">
              parallax<span aria-hidden="true">✦</span>
            </Link>
            <nav className="site-nav" aria-label="Study navigation">
              {links.map(([to, label, Icon]) => (
                <NavLink key={to} to={to}>
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="site-stats">
              <span title="Day streak">
                <Flame size={18} aria-hidden="true" />
                {stats.current}
                <span className="visually-hidden"> day streak</span>
              </span>
              <span className="xp-badge">✦ {stats.totalXp} XP</span>
              <AppearanceToggles />
              <Link
                to="/settings"
                className="avatar"
                aria-label="Open settings"
              >
                {(user?.displayName || user?.email || "P")[0].toUpperCase()}
              </Link>
            </div>
          </div>
        </header>
        <div className="shell-body">
          <StudyReminder />
          <BackgroundReminderSync />
          <Outlet />
        </div>
        <footer className="site-footer">
          <div className="site-footer-inner">
            <span className="sync-status" role="status">
              {store.storageError
                ? "Browser storage unavailable"
                : store.status}
            </span>
            <button
              className="signout"
              onClick={() =>
                void logout().catch(() =>
                  window.alert("Sign-out failed. Please retry."),
                )
              }
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
          <p>
            Draft lessons · Full theory · Real questions. Your progress belongs
            to you.
          </p>
        </footer>
        <nav className="tab-bar" aria-label="Mobile study navigation">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to}>
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </TutorDockProvider>
  );
}
