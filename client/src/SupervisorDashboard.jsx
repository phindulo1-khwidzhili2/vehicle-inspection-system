import { useEffect, useState } from "react";
import API from "./api";

export default function SupervisorDashboard() {
  const [inspections, setInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [details, setDetails] = useState(null);

  async function loadInspections() {
    const res = await API.get("/pending-inspections");
    setInspections(res.data);
  }

  useEffect(() => {
    loadInspections();
  }, []);

  async function viewDetails(inspection) {
    const res = await API.get(`/inspections/${inspection.inspection_id}/details`);
    setSelectedInspection(inspection);
    setDetails(res.data);
  }

  async function approve(id) {
    await API.patch(`/inspections/${id}/approve`, {
      status: "APPROVED",
      supervisor_comment: "Approved",
    });

    alert("Inspection approved");
    setSelectedInspection(null);
    setDetails(null);
    loadInspections();
  }

  async function decline(id) {
    const reason = prompt("Enter reason for declining:");

    await API.patch(`/inspections/${id}/approve`, {
      status: "DECLINED",
      supervisor_comment: reason || "Declined",
    });

    alert("Inspection declined");
    setSelectedInspection(null);
    setDetails(null);
    loadInspections();
  }

  const total = inspections.length;
  const doNotOperate = inspections.filter(
    (i) => i.overall_result === "DO_NOT_OPERATE"
  ).length;
  const goButReport = inspections.filter(
    (i) => i.overall_result === "GO_BUT_REPORT"
  ).length;
  const safe = inspections.filter(
    (i) => i.overall_result === "SAFE_TO_USE"
  ).length;

  function resultStyle(result) {
    if (result === "DO_NOT_OPERATE") return styles.dangerText;
    if (result === "GO_BUT_REPORT") return styles.warningText;
    return styles.successText;
  }

  if (selectedInspection && details) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button style={styles.lightButton} onClick={() => {
            setSelectedInspection(null);
            setDetails(null);
          }}>
            ← Back
          </button>

          <h2 style={styles.title}>Inspection Details</h2>
          <p style={styles.subtitle}>Review evidence before approval</p>
        </div>

        <div style={styles.card}>
          <h3>{details.inspection.registration_number}</h3>
          <p>{details.inspection.vehicle_code} • {details.inspection.vehicle_type}</p>

          <div style={styles.infoRow}>
            <span>Operator</span>
            <b>{details.inspection.operator_name}</b>
          </div>

          <div style={styles.infoRow}>
            <span>Overall Result</span>
            <b style={resultStyle(details.inspection.overall_result)}>
              {details.inspection.overall_result}
            </b>
          </div>

          <div style={styles.infoRow}>
            <span>Mileage</span>
            <b>{details.inspection.mileage || "N/A"}</b>
          </div>

          <div style={styles.infoRow}>
            <span>Fuel Level</span>
            <b>{details.inspection.fuel_level || "N/A"}</b>
          </div>
        </div>

        <h3 style={styles.sectionTitle}>Checklist Review</h3>

        {details.answers.map((answer, index) => (
          <div key={index} style={styles.answerCard}>
            <div style={styles.cardTop}>
              <div>
                <h4 style={{ margin: 0 }}>{answer.item_name}</h4>
                <p style={styles.vehicleSub}>
                  {answer.category_name} • Class {answer.hazard_class}
                </p>
              </div>

              <span
                style={
                  answer.answer === "NO"
                    ? styles.noBadge
                    : answer.answer === "YES"
                    ? styles.yesBadge
                    : styles.naBadge
                }
              >
                {answer.answer}
              </span>
            </div>

            {answer.comment && (
              <div style={styles.feedbackBox}>
                <b>Comment</b>
                <p>{answer.comment}</p>
              </div>
            )}

            {answer.photo_url && (
              <div style={styles.photoBox}>
                <b>Defect Photo</b>
                <br />
                <img
                  src={answer.photo_url}
                  alt="Defect"
                  style={styles.photo}
                />
              </div>
            )}
          </div>
        ))}

        <div style={styles.actionBar}>
          <button
            style={styles.approveButton}
            onClick={() => approve(details.inspection.inspection_id)}
          >
            Approve Inspection
          </button>

          <button
            style={styles.declineButton}
            onClick={() => decline(details.inspection.inspection_id)}
          >
            Decline Inspection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Supervisor Dashboard</h2>
        <p style={styles.subtitle}>Review pending vehicle inspections</p>
      </div>

      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <p>Pending</p>
          <h2>{total}</h2>
        </div>

        <div style={styles.kpiCard}>
          <p>Do Not Operate</p>
          <h2 style={styles.dangerText}>{doNotOperate}</h2>
        </div>

        <div style={styles.kpiCard}>
          <p>Go But Report</p>
          <h2 style={styles.warningText}>{goButReport}</h2>
        </div>

        <div style={styles.kpiCard}>
          <p>Safe</p>
          <h2 style={styles.successText}>{safe}</h2>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Pending Approvals</h3>

      {inspections.length === 0 && (
        <div style={styles.emptyCard}>
          <p>No pending inspections found.</p>
        </div>
      )}

      {inspections.map((inspection) => (
        <div key={inspection.inspection_id} style={styles.card}>
          <div style={styles.cardTop}>
            <div>
              <h3 style={styles.vehicleTitle}>{inspection.registration_number}</h3>
              <p style={styles.vehicleSub}>
                {inspection.vehicle_code} • {inspection.vehicle_type}
              </p>
            </div>

            <span style={styles.pendingBadge}>PENDING</span>
          </div>

          <div style={styles.infoRow}>
            <span>Operator</span>
            <b>{inspection.operator_name}</b>
          </div>

          <div style={styles.infoRow}>
            <span>Result</span>
            <b style={resultStyle(inspection.overall_result)}>
              {inspection.overall_result}
            </b>
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.viewButton} onClick={() => viewDetails(inspection)}>
              View Details
            </button>

            <button style={styles.approveButton} onClick={() => approve(inspection.inspection_id)}>
              Approve
            </button>

            <button style={styles.declineButton} onClick={() => decline(inspection.inspection_id)}>
              Decline
            </button>
          </div>
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
  answerCard: {
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
    gap: 10,
  },
  buttonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
    marginTop: 14,
  },
  actionBar: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 20,
  },
  viewButton: {
    background: "#111827",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 10,
    fontWeight: "bold",
  },
  approveButton: {
    background: "#166534",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 10,
    fontWeight: "bold",
  },
  declineButton: {
    background: "#991b1b",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 10,
    fontWeight: "bold",
  },
  lightButton: {
    background: "white",
    color: "#111827",
    border: "none",
    padding: 10,
    borderRadius: 10,
    fontWeight: "bold",
    marginBottom: 12,
  },
  pendingBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  yesBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  noBadge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  naBadge: {
    background: "#e5e7eb",
    color: "#374151",
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
  photoBox: {
    marginTop: 12,
  },
  photo: {
    width: "100%",
    maxWidth: 260,
    borderRadius: 12,
    border: "1px solid #ccc",
    marginTop: 8,
  },
  emptyCard: {
    background: "white",
    padding: 16,
    borderRadius: 16,
  },
};