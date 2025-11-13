import React, { useState } from "react";
import { getIssued } from "./libs/store";
import { gatewayUrl } from "./libs/ipfs";

export default function Verify() {
  const [cidInput, setCidInput] = useState("");
  const [result, setResult] = useState(null); // { type: "valid" | "revoked" | "not_found" | "error", record?, message? }

  const handleVerify = () => {
    const trimmed = cidInput.trim();

    if (!trimmed) {
      setResult({
        type: "error",
        message: "Please enter a CID / ID to verify.",
      });
      return;
    }

    const issued = getIssued();
    const rec = issued.find((r) => r.cid === trimmed);

    if (!rec) {
      setResult({
        type: "not_found",
        message:
          "No certificate found with this CID / ID in the admin-issued records.",
      });
      return;
    }

    if (rec.revoked) {
      setResult({
        type: "revoked",
        record: rec,
      });
      return;
    }

    setResult({
      type: "valid",
      record: rec,
    });
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.type === "error") {
      return (
        <p style={{ marginTop: "20px", color: "red" }}>{result.message}</p>
      );
    }

    if (result.type === "not_found") {
      return (
        <div style={{ marginTop: "20px" }}>
          <p style={{ color: "gray" }}>⚪ Certificate NOT FOUND.</p>
          <p style={{ color: "#555" }}>
            Only certificates issued by the teacher (Admin – Issued) can be
            verified here.
          </p>
        </div>
      );
    }

    if (result.type === "revoked") {
      const rec = result.record;
      return (
        <div style={{ marginTop: "20px" }}>
          <p style={{ color: "#b36b00", fontWeight: "bold" }}>
            ⚠ Certificate found, but it has been REVOKED by the admin.
          </p>
          <p>
            <strong>Student:</strong> {rec.name}
            <br />
            <strong>Course:</strong> {rec.course}
            <br />
            <strong>Class / Batch:</strong> {rec.className || "-"}
            <br />
            <strong>CID / ID:</strong> {rec.cid}
            <br />
            <strong>Issued At:</strong>{" "}
            {new Date(rec.issuedAt * 1000).toLocaleString()}
          </p>
        </div>
      );
    }

    if (result.type === "valid") {
      const rec = result.record;
      const imgCid = rec.imageCid || rec.cid;
      const imgUrl = gatewayUrl(imgCid);

      return (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            maxWidth: "800px",
          }}
        >
          {/* Status line */}
          <p style={{ marginBottom: "12px" }}>
            <span
              style={{
                display: "inline-block",
                marginRight: "6px",
                fontSize: "18px",
              }}
            >
              ✅
            </span>
            <span style={{ fontWeight: "bold", color: "green" }}>
              Certificate is VALID
            </span>{" "}
            <span style={{ color: "#555" }}>
              (based on admin-issued records).
            </span>
          </p>

          {/* Layout: image + details side by side */}
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            {/* Preview image */}
            <div>
              <img
                src={imgUrl}
                alt="Certificate preview"
                style={{
                  width: "160px",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <div style={{ marginTop: "8px", fontSize: "12px", color: "#555" }}>
                Preview from IPFS:
                <br />
                <a href={imgUrl} target="_blank" rel="noreferrer">
                  {imgUrl}
                </a>
              </div>
            </div>

            {/* Text details */}
            <div style={{ flex: 1, fontSize: "14px" }}>
              <p>
                <strong>Student:</strong> {rec.name}
                <br />
                <strong>Course:</strong> {rec.course}
                <br />
                <strong>Class / Batch:</strong> {rec.className || "-"}
                <br />
                <strong>CID / ID:</strong> {rec.cid}
                <br />
                <strong>Issued At:</strong>{" "}
                {new Date(rec.issuedAt * 1000).toLocaleString()}
              </p>

              {rec.txHash && (
                <p style={{ marginTop: "8px" }}>
                  <strong>Blockchain Tx:</strong>{" "}
                  <a
                    href={`https://www.oklink.com/amoy/tx/${rec.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on Explorer
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <h2>Student – Verify Certificate</h2>
      <p>
        Enter the CID / ID printed on the certificate. Verification uses only
        the certificates generated by the teacher (Admin Issued).
      </p>

      <div style={{ marginTop: "20px" }}>
        <input
          style={{ padding: "6px 10px", minWidth: "360px" }}
          placeholder="Qm... or bafy..."
          value={cidInput}
          onChange={(e) => setCidInput(e.target.value)}
        />
        <button
          style={{
            marginLeft: "8px",
            padding: "6px 18px",
            background: "black",
            color: "white",
            borderRadius: "8px",
          }}
          onClick={handleVerify}
        >
          Verify
        </button>
      </div>

      {renderResult()}
    </div>
  );
}
