import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
} from "firebase/auth";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../lib/firebase";
import { authError } from "../lib/auth-errors";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
const EMAIL_KEY = "parallax-sign-in-email";
export function Login() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailLink, setEmailLink] = useState(() =>
    isSignInWithEmailLink(auth, window.location.href),
  );
  const attemptedLink = useRef(false);
  const from: unknown = (location.state as { from?: unknown } | null)?.from;
  // Only accept known internal destinations; never navigate to a user-provided URL.
  const destination = from === "/learn" ? from : "/dashboard";
  async function finishLink(address: string) {
    setBusy(true);
    setError("");
    try {
      await signInWithEmailLink(auth, address, window.location.href);
      try {
        localStorage.removeItem(EMAIL_KEY);
      } catch {
        /* Email confirmation also works without local storage. */
      }
      window.history.replaceState(null, "", "/login");
      setEmailLink(false);
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!emailLink || attemptedLink.current) return;
    attemptedLink.current = true;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(EMAIL_KEY);
    } catch {
      /* Ask for email on another device or when storage is blocked. */
    }
    if (saved) {
      setEmail(saved);
      void finishLink(saved);
    } else
      setMessage(
        "Confirm the email address that received this link to finish signing in.",
      );
  }, [emailLink]);
  if (loading)
    return (
      <main id="main" className="placeholder" role="status">
        Restoring your session…
      </main>
    );
  if (user) return <Navigate to={destination} replace />;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (emailLink) {
      await finishLink(email.trim());
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await sendSignInLinkToEmail(auth, email.trim(), {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      try {
        localStorage.setItem(EMAIL_KEY, email.trim());
      } catch {
        /* Cross-device confirmation is available as a fallback. */
      }
      setMessage(
        "Check your inbox for a sign-in link. You can open it on this device or confirm your email on another device.",
      );
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setBusy(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="login-page">
      <section className="login-card">
        <p className="eyebrow">YOUR NEXT PERSPECTIVE</p>
        <h1>
          Welcome
          <br />
          <em>to Parallax.</em>
        </h1>
        <p className="login-description">
          One account for your journey through science.
        </p>
        {!emailLink && (
          <>
            <Button
              variant="outline"
              onClick={() => void google()}
              disabled={busy}
            >
              Continue with Google
            </Button>
            <div className="login-divider">or use an email link</div>
          </>
        )}
        <form onSubmit={(event) => void submit(event)}>
          <label htmlFor="email">Your email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
          <Button type="submit" disabled={busy}>
            {busy
              ? "Please wait…"
              : emailLink
                ? "Finish signing in"
                : "Send sign-in link"}
          </Button>
        </form>
        {message && (
          <p role="status" className="login-message">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="login-error">
            {error}
          </p>
        )}
        {emailLink && (
          <button
            className="text-button"
            disabled={busy}
            onClick={() => {
              window.history.replaceState(null, "", "/login");
              setEmailLink(false);
              setMessage("");
              setError("");
            }}
          >
            Request a new link instead
          </button>
        )}
        <p className="login-footnote">
          No password to remember. On a shared device, sign out when you’re
          finished.
        </p>
      </section>
    </main>
  );
}
