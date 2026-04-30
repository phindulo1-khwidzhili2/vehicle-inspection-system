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
      <div style={styles.card}>
        <div style={styles.logoBox}>✓</div>

        <h1 style={styles.title}>Vehicle Inspection</h1>
        <p style={styles.subtitle}>Pre-use safety inspection system</p>

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
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button}>Login</button>
        </form>

        <div style={styles.footer}>
          <p>Mining Vehicle Safety • QR Inspection • Supervisor Approval</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #111827, #374151)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "white",
    padding: 28,
    borderRadius: 22,
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  },
  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    background: "#111827",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 28,
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 25,
  },
  label: {
    display: "block",
    marginBottom: 6,
    marginTop: 14,
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 15,
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    marginTop: 22,
    padding: 15,
    borderRadius: 14,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
  },
  footer: {
    marginTop: 22,
    paddingTop: 15,
    borderTop: "1px solid #e5e7eb",
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
};