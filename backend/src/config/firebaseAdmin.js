/**
 * config/firebaseAdmin.js
 * ------------------------------------------------
 * Idempotent Firebase Admin app initializer, shared by middleware/auth.js
 * (ID token verification) and notification.push.js (FCM). Whichever
 * module runs first initializes the app; everyone else just reuses it —
 * `initializeApp` is guarded by `getApps().length` so calling this
 * multiple times is safe.
 *
 * Uses the SAME env var as middleware/auth.js (FIREBASE_SERVICE_ACCOUNT_JSON)
 * so there's only one Firebase credential to configure.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function ensureFirebaseApp() {
  if (getApps().length) return true;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) return false;

  initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
  return true;
}

/** Returns a firebase-admin Messaging instance, or null if Firebase isn't configured. */
export function getFirebaseMessaging() {
  if (!ensureFirebaseApp()) return null;
  return getMessaging();
}