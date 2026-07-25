/**
 * AuraFarm — Auth middleware (Firebase ID token verification)
 * ------------------------------------------------
 * REPLACES the original middleware/auth.js. This is a deliberate,
 * necessary change (not an incidental refactor) — reviving the backend
 * per your decision means auth has to match what the frontend actually
 * does today, and the frontend authenticates entirely through Firebase
 * (see client AuthContext.jsx), not the old JWT-in-cookie/Bearer scheme
 * this file used to implement. There is no JWT issuance anywhere in the
 * current frontend to verify against anymore.
 *
 * What changed, concretely:
 *   - OLD: `jwt.verify(token, JWT_SECRET)` against a token this backend
 *     issued itself, then looked up `User` by `decoded.userId`.
 *   - NEW: `getAuth().verifyIdToken(token)` against a token Firebase
 *     issued client-side, then find-or-create a `User` row keyed by the
 *     new `firebaseUid` field (see schema.additions.prisma) — the first
 *     time a given Firebase user hits the backend, a User row is
 *     created for them automatically (upsert), so there's no separate
 *     "register" step needed.
 *
 * `req.user` still ends up as a Prisma `User` row either way, so EVERY
 * existing controller that reads `req.user.id` (missionController.js,
 * objectiveController.js, xpController.js, activityController.js,
 * analyticsController.js, userController.js, and everything in the new
 * Forge/Resource system) keeps working completely unchanged — this
 * migration is isolated entirely to this one file.
 *
 * Setup required (see migration-notes.md §5):
 *   npm install firebase-admin
 *   Set FIREBASE_SERVICE_ACCOUNT_JSON in .env (the service account key
 *   JSON, as a single-line string) — Firebase Console → Project Settings
 *   → Service Accounts → Generate new private key.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { PrismaClient } from "@prisma/client";
import { buildFirebaseUserCreateData } from "../utils/firebaseUserData.js";

const prisma = new PrismaClient();

let firebaseAdminAuth;

if (!getApps().length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
  }
}

if (getApps().length) {
  firebaseAdminAuth = getAuth();
}

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
};

/**
 * Finds the User row for a Firebase-authenticated request, creating one
 * on first sight of a given Firebase UID. This replaces the old
 * (nonexistent-now) registration flow — there's no separate "sign up"
 * endpoint anymore since Google sign-in via Firebase IS the sign-up.
 */
async function findOrCreateUserForFirebaseUid(decodedToken) {
  const existing = await prisma.user.findUnique({
    where: { firebaseUid: decodedToken.uid },
  });
  if (existing) return existing;

  const createData = buildFirebaseUserCreateData(decodedToken);

  return prisma.user.create({
    data: {
      ...createData,
    },
  });
}

export const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    if (!firebaseAdminAuth) {
      return res.status(503).json({ message: "Firebase admin auth is not configured" });
    }

    const decoded = await firebaseAdminAuth.verifyIdToken(token);
    const user = await findOrCreateUserForFirebaseUid(decoded);

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid auth token" });
  }
};
