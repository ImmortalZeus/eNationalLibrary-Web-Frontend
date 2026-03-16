import { useState } from "react";
import { PALETTE } from "../data/constants";

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

export default function RegisterPage({ onNavigateToLogin, onNavigateToHome }: RegisterPageProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // TODO: connect to register API
    alert(`Registered as ${form.fullName}`);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1.5px solid #e0d5d0",
    borderRadius: 8,
    padding: "11px 14px",
    fontSize: 14,
    color: PALETTE.darkNavy,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13.5,
    fontWeight: 500,
    color: PALETTE.darkNavy,
    marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${PALETTE.blushCream} 0%, #e8f5f1 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: 24,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "40px 48px",
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 8px 40px rgba(64,78,92,0.12)",
      }}>
        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: PALETTE.mintTeal,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: 22, color: PALETTE.darkNavy, margin: "0 0 6px", fontWeight: 700 }}>
          Create Reader Account
        </h1>
        <p style={{ textAlign: "center", fontSize: 13.5, color: PALETTE.slateGrey, margin: "0 0 28px" }}>
          Register to start borrowing books
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={handleChange("fullName")}
              placeholder="John Doe"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = PALETTE.mintTeal)}
              onBlur={(e) => (e.target.style.borderColor = "#e0d5d0")}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="john@example.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = PALETTE.mintTeal)}
              onBlur={(e) => (e.target.style.borderColor = "#e0d5d0")}
            />
          </div>

          <div>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="+1 234 567 8900"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = PALETTE.mintTeal)}
              onBlur={(e) => (e.target.style.borderColor = "#e0d5d0")}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Create a password"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = PALETTE.mintTeal)}
              onBlur={(e) => (e.target.style.borderColor = "#e0d5d0")}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Confirm your password"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = PALETTE.mintTeal)}
              onBlur={(e) => (e.target.style.borderColor = "#e0d5d0")}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px 0",
              border: "none",
              borderRadius: 8,
              background: PALETTE.mintTeal,
              color: PALETTE.darkNavy,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s",
              marginTop: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Register
          </button>
        </form>

        {/* Footer links */}
        <p style={{ textAlign: "center", fontSize: 13, color: PALETTE.slateGrey, marginTop: 20, marginBottom: 8 }}>
          Already have an account?{" "}
          <span
            onClick={onNavigateToLogin}
            style={{ color: PALETTE.burntOrange, cursor: "pointer", fontWeight: 500 }}
          >
            Login here
          </span>
        </p>
        <p style={{ textAlign: "center", fontSize: 13, color: PALETTE.slateGrey, margin: 0 }}>
          <span
            onClick={onNavigateToHome}
            style={{ cursor: "pointer" }}
          >
            ← Back to Home
          </span>
        </p>
      </div>
    </div>
  );
}