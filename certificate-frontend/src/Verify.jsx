import React, { useState } from "react";
import { resolveCertificate } from "./ethers-client";

export default function Verify() {
  const [cid, setCid] = useState("");
  const [out, setOut] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleVerify() {
    try {
      setIsError(false);
      setOut("Resolving contract...");
      const cert = await resolveCertificate();
      const data = await cert.verifyByCid(cid);

      setOut(
        [
          `exists: ${data.exists}`,
          `issuer: ${data.issuer}`,
          `subjectName: ${data.subjectName}`,
          `course: ${data.course}`,
          `contentHash: ${data.contentHash}`,
          `issuedAt: ${data.issuedAt}`,
        ].join("\n")
      );
    } catch (err) {
      setIsError(true);
      setOut("❌ " + (err?.message ?? String(err)));
    }
  }

  return (
    <section className="card">
      <h3>Verify Certificate</h3>

      <div className="grid grid-2">
        <div style={{ gridColumn: "1 / -1" }}>
          <label>CID</label>
          <div className="row">
            <input
              className="input"
              placeholder="bafy... or Qm..."
              value={cid}
              onChange={(e) => setCid(e.target.value.trim())}
            />
            <button className="btn btn-secondary" onClick={handleVerify}>Verify</button>
          </div>
        </div>
      </div>

      {out && <pre className={`status ${isError ? "error" : ""}`}>{out}</pre>}
    </section>
  );
}
