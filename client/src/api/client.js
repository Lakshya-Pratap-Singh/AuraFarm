/**
 * AuraFarm — API client
 * ------------------------------------------------
 * Thin fetch wrapper for the revived Express/Prisma backend. Every call
 * automatically attaches the current Firebase user's ID token as a
 * Bearer token — this is what the new middleware/auth.js verifies
 * server-side (see that file's header comment for the full picture).
 *
 * Drop this in as src/api/client.js. Uses the EXISTING `VITE_API_URL` env
 * var (already present in your .env, just currently unused — see
 * migration-notes.md).
 */
import { auth } from "../firebase.js";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

async function getAuthHeader() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function request(path, { method = "GET", body, params } = {}) {
  const authHeader = await getAuthHeader();

  let url = `${BASE_URL}/api/v1${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeader
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const apiClient = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path, body) => request(path, { method: "DELETE", body })
};