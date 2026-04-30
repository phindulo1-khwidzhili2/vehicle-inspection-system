import { useEffect, useState } from "react";
import API from "./api";

export default function OperatorDashboard({ user }) {
  const [inspections, setInspections] = useState([]);

  useEffect(() => {
    API.get("/my-inspections").then((res) => {
      setInspections(res.data);
    });
  }, []);

  const total = inspections.length;
  const approved = inspections.filter((i) => i.inspection_status === "APPROVED").length;
  const pending = inspections.filter((i) => i.inspection_status === "PENDING_APPROVAL").length;
  const declined = inspections.filter((i) => i.inspection_status === "DECLINED").length;

  function statusStyle(status) {
    if (status === "APPROVED") return styles.approvedBadge;
    if (status === "DECLINED") return styles.declinedBadge;
    return styles.pendingBadge;
  }

  function resultStyle(result) {
    if (result === "DO_NOT_OPERATE") return styles.dangerText;
    if (result === "GO_BUT_REPORT") return styles.warningText;
    return styles.successText;
  }

  const latest = inspections[0];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Operator Dashboard</h2>
        <p style={styles.subtitle}>Welcome, {user?.full_name || "Operator"}</p>
      </div>

      {latest && (
        <div style={styles.latestCard}>
          <p style={styles.smallLabel}>Latest Inspection</p>
          <h3>{latest.registration_number}</h3>
          <p>
            Status:{" "}
            <span style={statusStyle(latest.inspection_status)}>
              {latest.inspection_status}
            </span>
          </p>

          {latest.supervisor_comment && (
            <p style={styles.comment}>{latest.supervisor_comment}</p>
          )}
        </div>
      )}

      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <p>Total</p>
          <h2>{total}</h2>
        </div>

        <div style={styles.kpiCard}>
          <p>Approved</p>
          <h2 style={styles.successText}>{approved}</h2>
        </div>

        <div style={styles.kpiCard}>
          <p>Pending</p>
          <h2 style={styles.warningText}>{pending}</h2>
        </div>

        <div style={styles.kpiCard}>
          <p>Declined</p>
          <h2 style={styles.dangerText}>{declined}</h2>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Inspection History</h3>

      {inspections.length === 0 && (
        <div style={styles.emptyCard}>
          <p>No inspections submitted yet.</p>
        </div>
      )}

      {inspections.map((i) => (
        <div key={i.inspection_id} style={styles.card}>
          <div style={styles.cardTop}>
            <div>
              <h3 style={styles.vehicleTitle}>{i.registration_number}</h3>
              <p style={styles.vehicleSub}>{i.vehicle_code} • {i.vehicle_type}</p>
            </div>

            <span style={statusStyle(i.inspection_status)}>
              {i.inspection_status}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span>Inspection Result</span>
            <b style={resultStyle(i.overall_result)}>{i.overall_result}</b>
          </div>

          {i.supervisor_comment && (
            <div style={styles.feedbackBox}>
              <b>Supervisor Feedback</b>
              <p>{i.supervisor_comment}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: 16,
    fontFamily: "Arial, sans-serif",
  },
  header: {
    background: "#111827",
    color: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    margin: 0,
  },
  subtitle: {
    marginTop: 6,
    color: "#d1d5db",
  },
  latestCard: {
    background: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  smallLabel: {
    color: "#6b7280",
    margin: 0,
    fontSize: 13,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    background: "white",
    padding: 16,
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    marginBottom: 10,
  },
  card: {
    background: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  vehicleTitle: {
    margin: 0,
  },
  vehicleSub: {
    marginTop: 4,
    color: "#6b7280",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #e5e7eb",
  },
  approvedBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  declinedBadge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  pendingBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  successText: {
    color: "#166534",
  },
  warningText: {
    color: "#92400e",
  },
  dangerText: {
    color: "#991b1b",
  },
  feedbackBox: {
    background: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    border: "1px solid #e5e7eb",
  },
  comment: {
    background: "#f9fafb",
    padding: 10,
    borderRadius: 10,
  },
  emptyCard: {
    background: "white",
    padding: 16,
    borderRadius: 16,
  },
};