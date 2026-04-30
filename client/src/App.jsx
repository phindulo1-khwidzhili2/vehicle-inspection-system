import { useState } from "react";
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

  if (!user) {
    return <Login setUser={setUser} />;
  }

  if (showChangePassword) {
    return (
      <ChangePassword onBack={() => setShowChangePassword(false)} />
    );
  }

  if (user.role === "ADMIN") {
    return (
      <>
        <button onClick={logout}>Logout</button>
        <button onClick={() => setShowChangePassword(true)}>
          Change Password
        </button>
        <AdminDashboard />
      </>
    );
  }

  if (user.role === "SUPERVISOR") {
    return (
      <>
        <button onClick={logout}>Logout</button>
        <button onClick={() => setShowChangePassword(true)}>
          Change Password
        </button>
        <SupervisorDashboard />
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <button onClick={logout}>Logout</button>

        <button onClick={() => setShowChangePassword(true)}>
          Change Password
        </button>

        <button onClick={() => setVehicle("HISTORY")}>
          View My Inspections
        </button>

        <ScanVehicle onScan={handleScan} />
      </>
    );
  }

  if (vehicle === "HISTORY") {
    return (
      <>
        <button onClick={() => setVehicle(null)}>Back</button>

        <button onClick={() => setShowChangePassword(true)}>
          Change Password
        </button>

        <OperatorDashboard user={user} />
      </>
    );
  }

  return (
    <>
      <button onClick={logout}>Logout</button>

      <button onClick={() => setShowChangePassword(true)}>
        Change Password
      </button>

      <InspectionForm vehicle={vehicle} user={user} />
    </>
  );
}