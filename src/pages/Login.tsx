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
import { Galaxy, SkyLoader, Starfield } from "../components/Sky";
/** The Google "G", in its four brand colours. */
function GoogleMark() {
  return (
    <svg
      className="google-mark"
      viewBox="0 0 48 48"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
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
  if (loading) return <SkyLoader label="Restoring your session" />;
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
      <Starfield />
      <Galaxy className="login-galaxy" />
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Welcome to Parallax.</h1>
        <p className="login-description">
          Sign in to keep your progress, streak and review cards.
        </p>
        {!emailLink && (
          <>
            <Button
              variant="outline"
              className="google-button"
              onClick={() => void google()}
              disabled={busy}
            >
              <GoogleMark />
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
