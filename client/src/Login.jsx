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
    <>
      <style>
        {`
          .login-page {
            min-height: 100vh;
            background-image:
              linear-gradient(135deg, rgba(2,6,23,0.92), rgba(15,23,42,0.78)),
              url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1800&q=80');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: Arial, sans-serif;
          }

          .login-shell {
            width: 100%;
            max-width: 1100px;
            display: grid;
            grid-template-columns: 1.1fr 420px;
            gap: 32px;
            align-items: center;
          }

          .left-panel {
            color: white;
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
            margin-bottom: 18px;
          }

          .hero-title {
            font-size: 52px;
            line-height: 1.05;
            margin: 0 0 18px 0;
          }

          .hero-text {
            font-size: 18px;
            line-height: 1.6;
            color: #dbeafe;
            max-width: 620px;
          }

          .feature-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 28px;
            max-width: 520px;
          }

          .feature-card {
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.18);
            padding: 16px;
            border-radius: 16px;
            font-weight: bold;
            backdrop-filter: blur(10px);
          }

          .login-card {
            background: rgba(255,255,255,0.97);
            padding: 32px;
            border-radius: 28px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.35);
          }

          .logo-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
          }

          .logo-box {
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

          .system-name {
            margin: 0;
            color: #0f172a;
          }

          .system-sub {
            margin: 3px 0 0 0;
            color: #64748b;
            font-size: 13px;
          }

          .title {
            margin: 0;
            font-size: 32px;
            color: #0f172a;
          }

          .subtitle {
            color: #64748b;
            margin-top: 8px;
            margin-bottom: 24px;
          }

          label {
            display: block;
            margin-bottom: 7px;
            margin-top: 14px;
            font-size: 14px;
            font-weight: bold;
            color: #334155;
          }

          input {
            width: 100%;
            padding: 15px;
            border-radius: 14px;
            border: 1px solid #cbd5e1;
            font-size: 15px;
            box-sizing: border-box;
            background: #f8fafc;
          }

          .login-button {
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
          }

          .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
            text-align: center;
          }

          @media (max-width: 768px) {
            .login-page {
              align-items: flex-start;
              padding: 18px;
              overflow-y: auto;
            }

            .login-shell {
              display: flex;
              flex-direction: column;
              gap: 18px;
            }

            .left-panel {
              width: 100%;
              padding-top: 10px;
            }

            .hero-title {
              font-size: 34px;
              line-height: 1.1;
            }

            .hero-text {
              font-size: 15px;
            }

            .feature-grid {
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 18px;
            }

            .feature-card {
              padding: 12px;
              font-size: 13px;
            }

            .login-card {
              width: 100%;
              box-sizing: border-box;
              padding: 24px;
              border-radius: 22px;
            }

            .title {
              font-size: 26px;
            }
          }
        `}
      </style>

      <div className="login-page">
        <div className="login-shell">
          <div className="left-panel">
            <div className="badge">Mining Safety System</div>

            <h1 className="hero-title">Vehicle Pre-Use Inspection Platform</h1>

            <p className="hero-text">
              QR-based inspections, defect photo evidence, supervisor approvals,
              and full operational traceability.
            </p>

            <div className="feature-grid">
              <div className="feature-card">QR Vehicle Scan</div>
              <div className="feature-card">Photo Evidence</div>
              <div className="feature-card">Supervisor Approval</div>
              <div className="feature-card">Audit History</div>
            </div>
          </div>

          <div className="login-card">
            <div className="logo-row">
              <div className="logo-box">V</div>
              <div>
                <h2 className="system-name">VInspect</h2>
                <p className="system-sub">Enterprise Access Portal</p>
              </div>
            </div>

            <h1 className="title">Welcome Back</h1>
            <p className="subtitle">Sign in to continue inspection workflow</p>

            <form onSubmit={login}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="operator@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button className="login-button">Login to Dashboard</button>
            </form>

            <div className="footer">
              Mining Vehicle Safety • QR Inspection • Supervisor Approval
            </div>
          </div>
        </div>
      </div>
    </>
  );
}