import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/login.css";

// Google's official multi-color "G" mark — required as-is per Google's
// brand guidelines for sign-in buttons (not recolored to match the theme).
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.7 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.7 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.7 13.6-4.7l-6.3-5.3C29.3 35.6 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.5 5.4-6.4 6.7l6.3 5.3C39.7 36.7 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function BatIcon() {
  return (
    <svg viewBox="0 0 64 32" fill="currentColor" aria-hidden="true">
      <path d="M32 6c-1.6-2.6-4.3-4.4-7.4-4.8 1 1.6 1.6 3.4 1.8 5.2-4-1.4-8.6-1-12 1.4 2.6.2 5 1.2 7 2.8C16 9.8 9.6 9.2 4 12c4 .4 7.8 2 11 4.4-3.4.6-6.6 2.2-9 4.6 3.6-.8 7.4-.6 10.8.8-2 2-3.2 4.6-3.4 7.4 2-2.4 4.6-4.2 7.6-5.2.8 2 2.2 3.8 4 5 .4-2 1.4-3.8 2.8-5.2L29 32l3-7.2 3 7.2 1.2-8.2c1.4 1.4 2.4 3.2 2.8 5.2 1.8-1.2 3.2-3 4-5 3 1 5.6 2.8 7.6 5.2-.2-2.8-1.4-5.4-3.4-7.4 3.4-1.4 7.2-1.6 10.8-.8-2.4-2.4-5.6-4-9-4.6 3.2-2.4 7-4 11-4.4-5.6-2.8-12-3.4-17.4-1.4 2-1.6 4.4-2.6 7-2.8-3.4-2.4-8-2.8-12-1.4.2-1.8.8-3.6 1.8-5.2C36.3 1.6 33.6 3.4 32 6Z" />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle, isAuthenticated, loading, authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  // Authenticated users never see this page — straight to the Dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    setLocalError("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch (error) {
      if (error?.code !== "auth/popup-closed-by-user") {
        setLocalError("Sign-in failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-bat" aria-hidden="true"><BatIcon /></span>
          <span className="login-logo">DAILY<span className="login-gold">WISE</span></span>
          <span className="login-tagline">TACTICAL DISCIPLINE</span>
        </div>

        <h1 className="login-title">OPERATIVE ACCESS</h1>
        <p className="login-subtitle">Authenticate to enter the Command Center.</p>

        <button
          type="button"
          className="login-google-btn"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          <GoogleIcon />
          {isSubmitting ? "Signing in…" : "Continue with Google"}
        </button>

        {(localError || authError) && (
          <p className="login-error">{localError || authError}</p>
        )}

        <p className="login-footnote">Single sign-on via Google — no password required.</p>
      </div>
    </div>
  );
}

export default Login;