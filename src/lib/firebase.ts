import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// Firebase web identifiers are public. Security rules, not this config, protect user data.
export const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBSSe8XOjx3dAb4h1Ert332830tKXwHf6M',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'parallax-73.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'parallax-73',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'parallax-73.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '121649892752',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:121649892752:web:a7850baaeae0a028ffb715',
});
export const auth = getAuth(app);
