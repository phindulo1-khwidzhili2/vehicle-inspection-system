import { useEffect, useState } from "react";
import Login from "./Login";
import ScanVehicle from "./ScanVehicle";
import InspectionForm from "./InspectionForm";
import SupervisorDashboard from "./SupervisorDashboard";
import OperatorDashboard from "./OperatorDashboard";
import AdminDashboard from "./AdminDashboard";
import ChangePassword from "./ChangePassword";
import API from "./api";

export default function App() {
  const savedUser = localStorage.getItem("user");
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [vehicle, setVehicle] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // AUTO LOGOUT AFTER INACTIVITY
  const INACTIVITY_LIMIT = 10 * 60 * 1000; // 15 minutes
  //const INACTIVITY_LIMIT = 1 * 60 * 1000;

  useEffect(() => {
    if (!user) return;

    let timer;

    function logoutDueToInactivity() {
      alert("Session expired due to inactivity. Please login again.");
      localStorage.clear();
      window.location.reload();
    }

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(logoutDueToInactivity, INACTIVITY_LIMIT);
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  async function handleScan(qrCode) {
    try {
      const res = await API.get(`/vehicle/${qrCode}`);
      setVehicle(res.data);
    } catch (err) {
      alert("Vehicle not found");
    }
  }

  function logout() {
    localStorage.clear();
    window.location.reload();
  }

  function TopActions({ showHistory = false, showBack = false }) {
    return (
      <div style={styles.actionBar}>
        <div style={styles.actionLeft}>
          {showBack && (
            <button
              style={styles.secondaryButton}
              onClick={() => setVehicle(null)}
            >
              ← Back
            </button>
          )}

          {showHistory && (
            <button
              style={styles.primaryButton}
              onClick={() => setVehicle("HISTORY")}
            >
              View My Inspections
            </button>
          )}

          <button
            style={styles.primaryButton}
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </button>
        </div>

        <button style={styles.logoutButton} onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  if (!user) {
    return <Login setUser={setUser} />;
  }

  if (showChangePassword) {
    return <ChangePassword onBack={() => setShowChangePassword(false)} />;
  }

  if (user.role === "ADMIN") {
    return (
      <>
        <TopActions />
        <AdminDashboard />
      </>
    );
  }

  if (user.role === "SUPERVISOR") {
    return (
      <>
        <TopActions />
        <SupervisorDashboard />
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <TopActions showHistory />
        <ScanVehicle onScan={handleScan} />
      </>
    );
  }

  if (vehicle === "HISTORY") {
    return (
      <>
        <TopActions showBack />
        <OperatorDashboard user={user} />
      </>
    );
  }

  return (
    <>
      <TopActions />
      <InspectionForm vehicle={vehicle} user={user} />
    </>
  );
}

const styles = {
  actionBar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "linear-gradient(135deg, #020617, #111827)",
    padding: "12px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    fontFamily: "Arial, sans-serif",
  },
  actionLeft: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #1d4ed8, #111827)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(30,64,175,0.25)",
  },
  secondaryButton: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: "bold",
    cursor: "pointer",
  },
  logoutButton: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: "bold",
    cursor: "pointer",
  },
};