import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function ensureFirebaseApp() {
  if (getApps().length) return true;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) return false;

  initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
  return true;
}

export function getFirebaseMessaging() {
  if (!ensureFirebaseApp()) return null;
  return getMessaging();
}
