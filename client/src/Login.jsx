import { useState } from "react";
import API from "./api";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login(e) {
    e.preventDefault();

    try {
      const res = await API.post("/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
    } catch (err) {
      alert("Invalid login details");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.shell}>
        <div style={styles.leftPanel}>
          <div style={styles.badge}>Mining Safety System</div>

          <h1 style={styles.heroTitle}>
            Vehicle Pre-Use Inspection Platform
          </h1>

          <p style={styles.heroText}>
            QR-based inspections, defect photo evidence, supervisor approvals,
            and full operational traceability.
          </p>

          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>QR Vehicle Scan</div>
            <div style={styles.featureCard}>Photo Evidence</div>
            <div style={styles.featureCard}>Supervisor Approval</div>
            <div style={styles.featureCard}>Audit History</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>V</div>
            <div>
              <h2 style={styles.systemName}>VInspect</h2>
              <p style={styles.systemSub}>Enterprise Access Portal</p>
            </div>
          </div>

          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to continue inspection workflow</p>

          <form onSubmit={login}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="operator@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            <button style={styles.button}>Login to Dashboard</button>
          </form>

          <div style={styles.securityBox}>
            <span style={styles.lockIcon}>🔒</span>
            <p>
              Secure role-based access for Admin, Supervisor, and Operator
              users.
            </p>
          </div>

          <div style={styles.footer}>
            <p>Mining Vehicle Safety • QR Inspection • Supervisor Approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1800&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    fontFamily: "Arial, sans-serif",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(2,6,23,0.92), rgba(15,23,42,0.72), rgba(30,41,59,0.78))",
  },
  shell: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: 1100,
    display: "grid",
    gridTemplateColumns: "1.2fr 420px",
    gap: 32,
    alignItems: "center",
  },
  leftPanel: {
    color: "white",
    padding: 30,
  },
  badge: {
    display: "inline-block",
    background: "rgba(37,99,235,0.25)",
    border: "1px solid rgba(147,197,253,0.4)",
    color: "#bfdbfe",
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 52,
    lineHeight: 1.05,
    margin: "0 0 18px 0",
    maxWidth: 680,
  },
  heroText: {
    fontSize: 18,
    lineHeight: 1.6,
    color: "#dbeafe",
    maxWidth: 620,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(160px, 1fr))",
    gap: 12,
    maxWidth: 520,
    marginTop: 28,
  },
  featureCard: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.16)",
    padding: 16,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
    fontWeight: "bold",
  },
  card: {
    background: "rgba(255,255,255,0.96)",
    padding: 32,
    borderRadius: 28,
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.6)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    background: "linear-gradient(135deg, #1d4ed8, #111827)",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 24,
    fontWeight: "bold",
    boxShadow: "0 10px 25px rgba(37,99,235,0.35)",
  },
  systemName: {
    margin: 0,
    color: "#0f172a",
    fontSize: 22,
  },
  systemSub: {
    margin: "3px 0 0 0",
    color: "#64748b",
    fontSize: 13,
  },
  title: {
    margin: 0,
    fontSize: 32,
    color: "#0f172a",
  },
  subtitle: {
    color: "#64748b",
    marginTop: 8,
    marginBottom: 26,
  },
  label: {
    display: "block",
    marginBottom: 7,
    marginTop: 14,
    fontSize: 14,
    fontWeight: "bold",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: 15,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    fontSize: 15,
    boxSizing: "border-box",
    outline: "none",
    background: "#f8fafc",
  },
  button: {
    width: "100%",
    marginTop: 24,
    padding: 16,
    borderRadius: 15,
    border: "none",
    background: "linear-gradient(135deg, #1d4ed8, #111827)",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 12px 25px rgba(30,64,175,0.3)",
  },
  securityBox: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1e3a8a",
    padding: 13,
    borderRadius: 16,
    marginTop: 20,
    fontSize: 13,
  },
  lockIcon: {
    marginTop: 2,
  },
  footer: {
    marginTop: 22,
    paddingTop: 15,
    borderTop: "1px solid #e2e8f0",
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
};