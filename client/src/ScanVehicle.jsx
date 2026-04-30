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
    <div style={{ padding: "20px" }}>
      <h2>Scan Vehicle QR Code</h2>
      <p>Allow camera permission, then scan the vehicle QR code.</p>
      <div id="reader" style={{ width: "100%" }}></div>
    </div>
  );
}