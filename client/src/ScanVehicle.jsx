import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanVehicle({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText.trim());
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <>
      <style>
        {`
          .scan-page {
            min-height: 100vh;
            background:
              linear-gradient(135deg, rgba(2,6,23,0.95), rgba(15,23,42,0.84)),
              url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1800&q=80');
            background-size: cover;
            background-position: center;
            padding: 24px;
            font-family: Arial, sans-serif;
            color: white;
          }

          .scan-shell {
            max-width: 720px;
            margin: 0 auto;
          }

          .scan-header {
            margin-bottom: 22px;
          }

          .scan-badge {
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

          .scan-title {
            font-size: 38px;
            margin: 0 0 10px 0;
          }

          .scan-subtitle {
            color: #dbeafe;
            line-height: 1.6;
            margin: 0;
          }

          .scanner-card {
            background: rgba(255,255,255,0.97);
            color: #0f172a;
            border-radius: 28px;
            padding: 24px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.35);
          }

          .scanner-top {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 18px;
          }

          .scanner-icon {
            width: 52px;
            height: 52px;
            border-radius: 18px;
            background: linear-gradient(135deg, #1d4ed8, #111827);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 22px;
          }

          .scanner-heading {
            margin: 0;
            font-size: 22px;
          }

          .scanner-note {
            margin: 3px 0 0 0;
            color: #64748b;
            font-size: 13px;
          }

          #reader {
            overflow: hidden;
            border-radius: 20px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
          }

          #reader button {
            background: linear-gradient(135deg, #1d4ed8, #111827) !important;
            color: white !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 10px 14px !important;
            font-weight: bold !important;
            cursor: pointer !important;
          }

          #reader select {
            padding: 10px !important;
            border-radius: 10px !important;
            border: 1px solid #cbd5e1 !important;
          }

          .scan-help {
            margin-top: 18px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1e3a8a;
            padding: 14px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
          }

          @media (max-width: 768px) {
            .scan-page {
              padding: 18px;
            }

            .scan-title {
              font-size: 30px;
            }

            .scanner-card {
              padding: 20px;
              border-radius: 22px;
            }
          }
        `}
      </style>

      <div className="scan-page">
        <div className="scan-shell">
          <div className="scan-header">
            <div className="scan-badge">QR Vehicle Verification</div>

            <h1 className="scan-title">Scan Vehicle QR Code</h1>

            <p className="scan-subtitle">
              Point your camera at the QR code attached to the vehicle to load
              its inspection profile.
            </p>
          </div>

          <div className="scanner-card">
            <div className="scanner-top">
              <div className="scanner-icon">QR</div>
              <div>
                <h2 className="scanner-heading">Vehicle Scanner</h2>
                <p className="scanner-note">
                  Allow camera access when prompted.
                </p>
              </div>
            </div>

            <div id="reader"></div>

            <div className="scan-help">
              Make sure the QR code is clear, not damaged, and well lit. The
              system will automatically load the vehicle once the code is read.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}