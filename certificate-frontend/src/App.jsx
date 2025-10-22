import { useState } from "react";
import { addCertificate, verifyCertificate } from "./ethers-client";

export default function App() {
  const [studentName, setStudentName] = useState("Huzaifa");
  const [course, setCourse] = useState("Blockchain 101");
  const [cid, setCid] = useState("bafybeibyxie2ajm2gsmsgm45g4e6r5jnkjae3k3s6djzdj4yffhossgh6u");

  const [status, setStatus] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  const onAdd = async () => {
    try {
      setStatus("Sending transaction...");
      const hash = await addCertificate(studentName, course, cid);
      setStatus(`✅ addCertificate tx sent: ${hash}`);
    } catch (e) {
      setStatus(`❌ ${e.message || e}`);
    }
  };

  const onVerify = async () => {
    try {
      setStatus("Verifying...");
      const data = await verifyCertificate(cid);
      setVerifyResult(data);
      setStatus("✅ Verified call succeeded");
    } catch (e) {
      setStatus(`❌ ${e.message || e}`);
    }
  };

  const tsToDate = (ts) => (ts ? new Date(ts * 1000).toLocaleString() : "-");

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Certificate DApp (Polygon Amoy)</h1>

      <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
        <label>Student Name
          <input value={studentName} onChange={(e) => setStudentName(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} />
        </label>

        <label>Course
          <input value={course} onChange={(e) => setCourse(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} />
        </label>

        <label>IPFS CID
          <input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="bafy... or Qm..." style={{ width: "100%", padding: "0.5rem" }} />
        </label>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button onClick={onAdd}>Add Certificate</button>
          <button onClick={onVerify}>Verify Certificate</button>
        </div>

        <div style={{ marginTop: "0.5rem" }}>
          <strong>Status:</strong> {status}
        </div>

        {verifyResult && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", border: "1px solid #ddd" }}>
            <div><strong>exists:</strong> {String(verifyResult.exists)}</div>
            <div><strong>studentName:</strong> {verifyResult.studentName}</div>
            <div><strong>course:</strong> {verifyResult.course}</div>
            <div><strong>storedHash:</strong> {verifyResult.storedHash}</div>
            <div><strong>issuedAt:</strong> {verifyResult.issuedAt} ({tsToDate(verifyResult.issuedAt)})</div>
          </div>
        )}
      </div>
    </div>
  );
}
