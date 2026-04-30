import { useEffect, useState } from "react";
import API from "./api";

export default function InspectionForm({ vehicle, user }) {
  const [checklist, setChecklist] = useState([]);
  const [answers, setAnswers] = useState({});
  const [mileage, setMileage] = useState("");
  const [fuelLevel, setFuelLevel] = useState("");

  useEffect(() => {
    API.get("/checklist").then((res) => setChecklist(res.data));
  }, []);

  function updateAnswer(itemId, value) {
    setAnswers({
      ...answers,
      [itemId]: {
        ...answers[itemId],
        answer: value,
      },
    });
  }

  async function uploadPhoto(itemId, file) {
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    const res = await API.post("/upload-defect-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setAnswers({
      ...answers,
      [itemId]: {
        ...answers[itemId],
        photo_url: res.data.photo_url,
      },
    });

    alert("Photo uploaded");
  }

  function calculateResult() {
    const hasAFail = checklist.some(
      (item) =>
        item.hazard_class === "A" &&
        answers[item.item_id]?.answer === "NO"
    );

    const hasBOrCFail = checklist.some(
      (item) =>
        (item.hazard_class === "B" || item.hazard_class === "C") &&
        answers[item.item_id]?.answer === "NO"
    );

    if (hasAFail) return "DO_NOT_OPERATE";
    if (hasBOrCFail) return "GO_BUT_REPORT";
    return "SAFE_TO_USE";
  }

  async function submitInspection() {
    const payload = {
      vehicle_id: vehicle.vehicle_id,
      supervisor_id: null,
      mileage,
      fuel_level: fuelLevel,
      overall_result: calculateResult(),
      operator_signature: user.full_name,
      answers: checklist.map((item) => ({
        item_id: item.item_id,
        answer: answers[item.item_id]?.answer || "N/A",
        comment: answers[item.item_id]?.comment || "",
        photo_url: answers[item.item_id]?.photo_url || null,
      })),
    };

    await API.post("/inspections", payload);

    alert("Inspection submitted for supervisor approval");
    window.location.reload();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Pre-Use Vehicle Inspection</h2>

      <p>
        <b>Vehicle:</b> {vehicle.registration_number}
      </p>
      <p>
        <b>Type:</b> {vehicle.vehicle_type}
      </p>

      <input
        placeholder="Mileage / KM Reading"
        value={mileage}
        onChange={(e) => setMileage(e.target.value)}
        style={styles.input}
      />

      <input
        placeholder="Fuel Level"
        value={fuelLevel}
        onChange={(e) => setFuelLevel(e.target.value)}
        style={styles.input}
      />

      {checklist.map((item) => (
        <div key={item.item_id} style={styles.card}>
          <b>{item.item_name}</b>
          <p>{item.category_name}</p>

          <button onClick={() => updateAnswer(item.item_id, "YES")}>
            YES
          </button>

          <button onClick={() => updateAnswer(item.item_id, "NO")}>
            NO
          </button>

          <button onClick={() => updateAnswer(item.item_id, "N/A")}>
            N/A
          </button>

          <p>Selected: {answers[item.item_id]?.answer || "Not answered"}</p>

          {answers[item.item_id]?.answer === "NO" && (
            <div style={{ marginTop: 10 }}>
              <p>Upload defect photo:</p>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) =>
                  uploadPhoto(item.item_id, e.target.files[0])
                }
              />

              {answers[item.item_id]?.photo_url && (
                <div>
                  <p>Photo uploaded:</p>
                  <img
                    src={answers[item.item_id].photo_url}
                    alt="Defect"
                    style={{
                      width: "120px",
                      borderRadius: "8px",
                      marginTop: "8px",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <h3>Result: {calculateResult()}</h3>

      <button onClick={submitInspection}>Submit Inspection</button>
    </div>
  );
}

const styles = {
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },
  card: {
    border: "1px solid #ccc",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },
};