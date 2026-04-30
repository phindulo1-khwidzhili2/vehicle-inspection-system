import { useState } from "react";
import API from "./api";

export default function ChangePassword({ onBack }) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  async function submit(e) {
    e.preventDefault();

    try {
      await API.patch("/change-password", form);

      alert("Password changed successfully. Please login again.");

      localStorage.clear();
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to change password");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.backButton} onClick={onBack}>
          ← Back
        </button>

        <h2 style={styles.title}>Change Password</h2>
        <p style={styles.subtitle}>
          Update your account password securely.
        </p>

        <form onSubmit={submit}>
          <label style={styles.label}>Old Password</label>
          <input
            type="password"
            value={form.oldPassword}
            onChange={(e) =>
              setForm({ ...form, oldPassword: e.target.value })
            }
            style={styles.input}
          />

          <label style={styles.label}>New Password</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) =>
              setForm({ ...form, newPassword: e.target.value })
            }
            style={styles.input}
          />

          <label style={styles.label}>Confirm New Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            style={styles.input}
          />

          <button style={styles.button}>Update Password</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "white",
    width: "100%",
    maxWidth: 420,
    padding: 25,
    borderRadius: 18,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  backButton: {
    background: "#e5e7eb",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    marginBottom: 15,
    fontWeight: "bold",
  },
  title: {
    margin: 0,
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 12,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: 13,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    marginTop: 20,
    padding: 14,
    border: "none",
    borderRadius: 12,
    background: "#111827",
    color: "white",
    fontWeight: "bold",
  },
};