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
    <>
      <style>
        {`
          .change-page {
            min-height: 100vh;
            background-image:
              linear-gradient(135deg, rgba(2,6,23,0.94), rgba(15,23,42,0.8)),
              url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1800&q=80');
            background-size: cover;
            background-position: center;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 24px;
            font-family: Arial, sans-serif;
          }

          .change-card {
            width: 100%;
            max-width: 460px;
            background: rgba(255,255,255,0.97);
            padding: 32px;
            border-radius: 28px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.35);
          }

          .change-logo-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
          }

          .change-logo {
            width: 54px;
            height: 54px;
            border-radius: 18px;
            background: linear-gradient(135deg, #1d4ed8, #111827);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            font-weight: bold;
          }

          .change-system {
            margin: 0;
            color: #0f172a;
          }

          .change-sub {
            margin: 3px 0 0 0;
            color: #64748b;
            font-size: 13px;
          }

          .back-btn {
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
            padding: 10px 14px;
            border-radius: 12px;
            margin-bottom: 18px;
            font-weight: bold;
            cursor: pointer;
          }

          .change-title {
            margin: 0;
            font-size: 32px;
            color: #0f172a;
          }

          .change-text {
            color: #64748b;
            margin-top: 8px;
            margin-bottom: 24px;
            line-height: 1.5;
          }

          .security-note {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1e3a8a;
            padding: 14px;
            border-radius: 16px;
            font-size: 13px;
            margin-bottom: 20px;
            line-height: 1.5;
          }

          .change-label {
            display: block;
            margin-bottom: 7px;
            margin-top: 14px;
            font-size: 14px;
            font-weight: bold;
            color: #334155;
          }

          .change-input {
            width: 100%;
            padding: 15px;
            border-radius: 14px;
            border: 1px solid #cbd5e1;
            font-size: 15px;
            box-sizing: border-box;
            outline: none;
            background: #f8fafc;
          }

          .change-button {
            width: 100%;
            margin-top: 24px;
            padding: 16px;
            border-radius: 15px;
            border: none;
            background: linear-gradient(135deg, #1d4ed8, #111827);
            color: white;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 12px 25px rgba(30,64,175,0.3);
          }

          .change-footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
            text-align: center;
          }

          @media (max-width: 768px) {
            .change-page {
              align-items: flex-start;
              padding: 18px;
            }

            .change-card {
              padding: 24px;
              border-radius: 22px;
              margin-top: 20px;
            }

            .change-title {
              font-size: 27px;
            }
          }
        `}
      </style>

      <div className="change-page">
        <div className="change-card">
          <button className="back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>

          <div className="change-logo-row">
            <div className="change-logo">🔒</div>
            <div>
              <h2 className="change-system">Account Security</h2>
              <p className="change-sub">VInspect Secure Access</p>
            </div>
          </div>

          <h1 className="change-title">Change Password</h1>
          <p className="change-text">
            Update your password to keep your inspection account protected.
          </p>

          <div className="security-note">
            Use a strong password with at least 8 characters. After updating,
            you will be logged out and asked to sign in again.
          </div>

          <form onSubmit={submit}>
            <label className="change-label">Old Password</label>
            <input
              className="change-input"
              type="password"
              placeholder="Enter current password"
              value={form.oldPassword}
              onChange={(e) =>
                setForm({ ...form, oldPassword: e.target.value })
              }
            />

            <label className="change-label">New Password</label>
            <input
              className="change-input"
              type="password"
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
            />

            <label className="change-label">Confirm New Password</label>
            <input
              className="change-input"
              type="password"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />

            <button className="change-button">Update Password</button>
          </form>

          <div className="change-footer">
            Secure password update • Role-based access • Protected session
          </div>
        </div>
      </div>
    </>
  );
}