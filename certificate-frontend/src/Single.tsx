// src/Single.tsx
import React, { useState } from "react";
import { resolveCertificate } from "./ethers-client";
import { pushIssued } from "./libs/store";         // <-- add
import { gatewayUrl } from "./libs/links";         // optional if you show links somewhere

export default function Single() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [className, setClassName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [manualCid, setManualCid] = useState("");  // paste from IPFS Desktop here
  const [status, setStatus] = useState("");

  async function handleIssue() {
    try {
      setStatus("Resolving contract...");
      const cert = await resolveCertificate();

      // we are in the "manual CID" mode again, so pick cid from input:
      const cid = manualCid.trim();
      if (!cid) { setStatus("❌ Please paste a CID from IPFS Desktop"); return; }

      // If you want to compute a hash of file locally for integrity, do it here
      // (you already had this earlier). For manual-CID flow we can skip.

      setStatus("Sending transaction (MetaMask)...");
      const tx = await cert.issueCertificate(name, course, cid, "0x" + "00".repeat(32));
      const receipt = await tx.wait();

      // persist for history
      pushIssued({
        cid,
        name,
        course,
        className: className || undefined,
        imageCid: cid,                      // show thumbnail from the same CID
        txHash: receipt.hash,
        issuedAt: Math.floor(Date.now() / 1000),
      });

      setStatus(`✅ Issued!\nCID: ${cid}\nTx: ${receipt.hash}`);
      // (Optional) clear fields:
      // setName(""); setCourse(""); setClassName(""); setManualCid(""); setFile(null);
    } catch (e: any) {
      setStatus("❌ " + (e?.message || String(e)));
    }
  }

  return (
    <section>
      <h3>Single Certificate</h3>

      <div>Subject name</div>
      <input value={name} onChange={(e) => setName(e.target.value)} />

      <div>Course</div>
      <input value={course} onChange={(e) => setCourse(e.target.value)} />

      <div>Class (optional)</div>
      <input value={className} onChange={(e) => setClassName(e.target.value)} />

      <div>Image file (optional)</div>
      <input type="file" onChange={(e)=> setFile(e.target.files?.[0] || null)} />

      <div style={{marginTop:8}}>CID (paste from IPFS Desktop)</div>
      <input value={manualCid} onChange={(e)=> setManualCid(e.target.value)} placeholder="bafy... or Qm..." />

      <div style={{marginTop:8}}>
        <button onClick={handleIssue}>Issue Certificate</button>
      </div>

      {status && (
        <pre style={{background:"#111",color:"#0f0",padding:10,whiteSpace:"pre-wrap",marginTop:10}}>
          {status}
        </pre>
      )}
    </section>
  );
}
