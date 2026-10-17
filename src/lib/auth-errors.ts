import { FirebaseError } from "firebase/app";
export function authError(error: unknown): string {
  if (!(error instanceof FirebaseError))
    return "Something went wrong. Please try again.";
  const messages: Record<string, string> = {
    "auth/popup-closed-by-user":
      "The sign-in window was closed. Try again when you’re ready.",
    "auth/popup-blocked":
      "Your browser blocked the sign-in window. Allow popups for this site and try again.",
    "auth/unauthorized-domain":
      "This website must be added to Firebase Authentication’s authorized domains.",
    "auth/operation-not-allowed":
      "This sign-in method has not been enabled in Firebase yet.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-action-code":
      "This sign-in link is invalid or has already been used. Request a new one.",
    "auth/expired-action-code":
      "This sign-in link has expired. Request a new one.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a little before trying again.",
    "auth/quota-exceeded":
      "The free sign-in email allowance has been reached. Try Google sign-in or return later.",
    "auth/network-request-failed":
      "Could not connect. Check your connection and try again.",
    "auth/web-storage-unsupported":
      "Browser storage is unavailable. Allow site storage and try again.",
    "auth/invalid-api-key":
      "Firebase configuration needs to be checked before sign-in can work.",
  };
  return (
    messages[error.code] || "Sign-in could not be completed. Please try again."
  );
}
