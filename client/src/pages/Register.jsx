import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", rememberMe: false });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "4rem auto", padding: "2rem", background: "#fff", borderRadius: 16 }}>
      <h2 style={{ marginBottom: "1rem" }}>Create your account</h2>
      <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>Start tracking progress and leveling up.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="username">Username</label>
          <input id="username" name="username" value={form.username} onChange={handleChange} required style={{ width: "100%", padding: 10, marginTop: 6 }} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: "100%", padding: 10, marginTop: 6 }} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: "100%", padding: 10, marginTop: 6 }} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
          <input name="rememberMe" type="checkbox" checked={form.rememberMe} onChange={handleChange} />
          Remember me
        </label>

        {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}

        <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: 12 }}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default Register;
