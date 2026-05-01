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
        item.hazard_class === "A" && answers[item.item_id]?.answer === "NO"
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

  function resultClass() {
    const result = calculateResult();

    if (result === "DO_NOT_OPERATE") return "result-danger";
    if (result === "GO_BUT_REPORT") return "result-warning";
    return "result-success";
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
    <>
      <style>
        {`
          .inspection-page {
            min-height: 100vh;
            background:
              linear-gradient(135deg, rgba(2,6,23,0.95), rgba(15,23,42,0.86)),
              url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1800&q=80');
            background-size: cover;
            background-position: center;
            padding: 24px;
            font-family: Arial, sans-serif;
            color: white;
          }

          .inspection-shell {
            max-width: 960px;
            margin: 0 auto;
          }

          .inspection-header {
            margin-bottom: 22px;
          }

          .badge {
            display: inline-block;
            background: rgba(37,99,235,0.3);
            border: 1px solid rgba(147,197,253,0.45);
            color: #bfdbfe;
            padding: 8px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 16px;
          }

          .inspection-title {
            font-size: 38px;
            margin: 0 0 10px 0;
          }

          .inspection-subtitle {
            color: #dbeafe;
            line-height: 1.6;
            margin: 0;
          }

          .vehicle-card {
            background: rgba(255,255,255,0.97);
            color: #0f172a;
            border-radius: 28px;
            padding: 24px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.35);
            margin-bottom: 18px;
          }

          .vehicle-top {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 18px;
          }

          .vehicle-icon {
            width: 54px;
            height: 54px;
            border-radius: 18px;
            background: linear-gradient(135deg, #1d4ed8, #111827);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 22px;
          }

          .vehicle-title {
            margin: 0;
            font-size: 24px;
          }

          .vehicle-sub {
            margin: 4px 0 0 0;
            color: #64748b;
            font-size: 14px;
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 16px;
          }

          .input-label {
            display: block;
            font-weight: bold;
            color: #334155;
            margin-bottom: 7px;
            font-size: 14px;
          }

          .inspection-input {
            width: 100%;
            padding: 15px;
            border-radius: 14px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            box-sizing: border-box;
            font-size: 15px;
            outline: none;
          }

          .result-card {
            position: sticky;
            top: 12px;
            z-index: 5;
            background: rgba(255,255,255,0.97);
            color: #0f172a;
            padding: 16px;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.18);
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .result-label {
            color: #64748b;
            font-size: 13px;
            margin: 0;
          }

          .result-pill {
            padding: 10px 14px;
            border-radius: 999px;
            font-weight: bold;
            font-size: 13px;
          }

          .result-success {
            background: #dcfce7;
            color: #166534;
          }

          .result-warning {
            background: #fef3c7;
            color: #92400e;
          }

          .result-danger {
            background: #fee2e2;
            color: #991b1b;
          }

          .checklist {
            display: grid;
            gap: 14px;
          }

          .item-card {
            background: rgba(255,255,255,0.97);
            color: #0f172a;
            border-radius: 22px;
            padding: 18px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.18);
            border: 1px solid rgba(255,255,255,0.65);
          }

          .item-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          }

          .item-title {
            margin: 0;
            font-size: 18px;
          }

          .item-category {
            margin: 5px 0 0 0;
            color: #64748b;
            font-size: 13px;
          }

          .hazard-pill {
            background: #eff6ff;
            color: #1d4ed8;
            padding: 7px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
          }

          .answer-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 16px;
          }

          .answer-btn {
            padding: 13px;
            border-radius: 14px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            font-weight: bold;
            cursor: pointer;
          }

          .answer-yes-active {
            background: #dcfce7;
            color: #166534;
            border-color: #86efac;
          }

          .answer-no-active {
            background: #fee2e2;
            color: #991b1b;
            border-color: #fca5a5;
          }

          .answer-na-active {
            background: #e5e7eb;
            color: #374151;
            border-color: #cbd5e1;
          }

          .selected-text {
            margin-top: 12px;
            font-size: 13px;
            color: #64748b;
          }

          .defect-box {
            margin-top: 14px;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 14px;
            border-radius: 16px;
          }

          .file-input {
            width: 100%;
            margin-top: 8px;
          }

          .photo-preview {
            margin-top: 12px;
          }

          .photo-preview img {
            width: 140px;
            border-radius: 12px;
            border: 1px solid #fed7aa;
          }

          .submit-card {
            background: rgba(255,255,255,0.97);
            color: #0f172a;
            padding: 20px;
            border-radius: 24px;
            margin-top: 18px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.28);
          }

          .submit-button {
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 15px;
            background: linear-gradient(135deg, #1d4ed8, #111827);
            color: white;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 12px 25px rgba(30,64,175,0.3);
          }

          @media (max-width: 768px) {
            .inspection-page {
              padding: 18px;
            }

            .inspection-title {
              font-size: 30px;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }

            .result-card {
              align-items: flex-start;
              flex-direction: column;
            }

            .answer-row {
              grid-template-columns: 1fr;
            }

            .vehicle-card,
            .item-card,
            .submit-card {
              border-radius: 20px;
            }
          }
        `}
      </style>

      <div className="inspection-page">
        <div className="inspection-shell">
          <div className="inspection-header">
            <div className="badge">Pre-Use Safety Inspection</div>
            <h1 className="inspection-title">Vehicle Inspection Checklist</h1>
            <p className="inspection-subtitle">
              Complete all safety checks before the vehicle is released for
              operation.
            </p>
          </div>

          <div className="vehicle-card">
            <div className="vehicle-top">
              <div className="vehicle-icon">V</div>
              <div>
                <h2 className="vehicle-title">
                  {vehicle.registration_number}
                </h2>
                <p className="vehicle-sub">
                  {vehicle.vehicle_code} • {vehicle.vehicle_type}
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div>
                <label className="input-label">Mileage / KM Reading</label>
                <input
                  className="inspection-input"
                  placeholder="Enter mileage"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Fuel Level</label>
                <input
                  className="inspection-input"
                  placeholder="Enter fuel level"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="result-card">
            <div>
              <p className="result-label">Current Inspection Result</p>
              <b>Calculated automatically from checklist answers</b>
            </div>

            <span className={`result-pill ${resultClass()}`}>
              {calculateResult()}
            </span>
          </div>

          <div className="checklist">
            {checklist.map((item) => {
              const selected = answers[item.item_id]?.answer;

              return (
                <div key={item.item_id} className="item-card">
                  <div className="item-top">
                    <div>
                      <h3 className="item-title">{item.item_name}</h3>
                      <p className="item-category">{item.category_name}</p>
                    </div>

                    <span className="hazard-pill">
                      Class {item.hazard_class}
                    </span>
                  </div>

                  <div className="answer-row">
                    <button
                      className={`answer-btn ${
                        selected === "YES" ? "answer-yes-active" : ""
                      }`}
                      onClick={() => updateAnswer(item.item_id, "YES")}
                    >
                      YES
                    </button>

                    <button
                      className={`answer-btn ${
                        selected === "NO" ? "answer-no-active" : ""
                      }`}
                      onClick={() => updateAnswer(item.item_id, "NO")}
                    >
                      NO
                    </button>

                    <button
                      className={`answer-btn ${
                        selected === "N/A" ? "answer-na-active" : ""
                      }`}
                      onClick={() => updateAnswer(item.item_id, "N/A")}
                    >
                      N/A
                    </button>
                  </div>

                  <p className="selected-text">
                    Selected: {selected || "Not answered"}
                  </p>

                  {selected === "NO" && (
                    <div className="defect-box">
                      <b>Defect photo required</b>
                      <p>
                        Capture or upload a clear photo showing the defect.
                      </p>

                      <input
                        className="file-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) =>
                          uploadPhoto(item.item_id, e.target.files[0])
                        }
                      />

                      {answers[item.item_id]?.photo_url && (
                        <div className="photo-preview">
                          <p>Photo uploaded:</p>
                          <img
                            src={answers[item.item_id].photo_url}
                            alt="Defect"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="submit-card">
            <button className="submit-button" onClick={submitInspection}>
              Submit Inspection for Supervisor Approval
            </button>
          </div>
        </div>
      </div>
    </>
  );
}