// AuthContext — Firebase Google Authentication.
//
// Replaces the previous backend session API (fetch + cookies against
// dailywise.onrender.com) entirely. onAuthStateChanged is what makes
// login survive a page refresh — Firebase persists the session in
// IndexedDB/localStorage on its own once setPersistence is set to
// browserLocalPersistence, so there's no manual token storage here.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";

const AuthContext = createContext(null);

// Narrows Firebase's User object down to just what this app displays —
// keeps the rest of the app decoupled from the Firebase SDK's shape.
function mapFirebaseUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Fires once on mount with whatever session Firebase already has
  // persisted locally, and again on every sign-in/sign-out — this single
  // listener is the source of truth for `user` and `loading`.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(mapFirebaseUser(firebaseUser));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, googleProvider);
      setUser(mapFirebaseUser(result.user));
      return result.user;
    } catch (error) {
      // The user closing the popup isn't a real failure — don't surface it
      if (error?.code !== "auth/popup-closed-by-user") {
        setAuthError(error?.message || "Google sign-in failed");
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      signInWithGoogle,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}