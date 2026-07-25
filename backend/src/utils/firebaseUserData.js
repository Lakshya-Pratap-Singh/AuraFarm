function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "user";
}

function normalizeEmail(email, uid) {
  if (typeof email === "string" && email.trim()) {
    return email.trim().toLowerCase();
  }

  return `firebase-${uid}@local.dailywise`;
}

function normalizeUsername(name, email, uid) {
  if (typeof name === "string" && name.trim()) {
    return slugify(name);
  }

  if (typeof email === "string" && email.trim()) {
    return slugify(email.split("@")[0]);
  }

  return slugify(`firebase-${uid}`);
}

export function buildFirebaseUserCreateData(decodedToken) {
  const uid = decodedToken?.uid || "unknown-user";
  const email = normalizeEmail(decodedToken?.email, uid);
  const username = normalizeUsername(decodedToken?.name, email, uid);

  return {
    firebaseUid: uid,
    email,
    username,
    passwordHash: `firebase:${uid}`,
  };
}
