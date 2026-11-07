import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const SITE = "Parallax";
const TITLES: Record<string, string> = {
  "/": "Parallax — A different perspective",
  "/login": "Sign in",
  "/dashboard": "Dashboard",
  "/learn": "Course map",
  "/projects": "Projects",
  "/review": "Review",
  "/revise": "Revise",
  "/stats": "Progress",
  "/author": "Author",
  "/settings": "Settings",
  "/learner-pilot": "Learner pilot",
  "/plan": "Weekly plan",
  "/revision-plan": "Revision plan",
  "/foundation-revision": "Foundation revision",
  "/placement": "Placement",
  "/teaching-lab": "Teaching lab",
};
/** Title for a pathname, or null when the page sets its own (lessons) or the path is unknown. */
function titleForPath(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/lesson/")) return null;
  if (path.startsWith("/foundation-revision/")) return `Foundation revision — ${SITE}`;
  const known = TITLES[path];
  if (!known) return `Page not found — ${SITE}`;
  return path === "/" ? known : `${known} — ${SITE}`;
}
/** Keeps document.title meaningful on every client-side route change (WCAG 2.4.2). */
export function RouteTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const title = titleForPath(pathname);
    if (title) document.title = title;
  }, [pathname]);
  return null;
}
