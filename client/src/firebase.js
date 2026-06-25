// Firebase configuration & initialization.
//
// All values are read from Vite env vars (VITE_FIREBASE_*) — real keys
// belong in your local .env file (gitignored), never committed to source
// control. Get these values from: Firebase Console → Project Settings →
// General → Your apps → Web app → SDK setup and configuration.
//
// See .env.example in the project root for the exact variable names.

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
console.log("API KEY =", import.meta.env.VITE_FIREBASE_API_KEY);
console.log("AUTH DOMAIN =", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;