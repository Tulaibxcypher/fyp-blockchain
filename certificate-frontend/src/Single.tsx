// src/Single.tsx
import React, { useState } from "react";
import { ethers } from "ethers";
import { resolveCertificate } from "./ethers-client";
import { pushIssued } from "./libs/store";
import { gatewayUrl, txUrl } from "./libs/links";

export default function Single() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [className, setClassName] = useState("");
  const [studentWallet, setStudentWallet] = useState("");
  const [cid, setCid] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleIssue() {
    try {
      setIsError(false);

      if (!name || !course || !className || !cid) {
        setIsError(true);
        setStatus("Please fill all fields and CID.");
        return;
      }

      if (studentWallet && !ethers.isAddress(studentWallet)) {
        setIsError(true);
        setStatus("Student wallet address is invalid.");
        return;
      }

      setStatus("Connecting to contract...");
      const cert = await resolveCertificate();

      const issuedTo =
        studentWallet && ethers.isAddress(studentWallet)
          ? studentWallet
          : ethers.ZeroAddress;

      setStatus("Sending transaction (please confirm in MetaMask)...");
      const tx = await cert.addCertificate(
        name,
        course,
        className,
        cid,
        issuedTo
      );

      setStatus("Waiting for confirmation...");
      const receipt = await tx.wait();

      const nowSec = Math.floor(Date.now() / 1000);

      // ✅ THIS is your admin “database” entry
      pushIssued({
        cid,
        name,
        course,
        className,
        imageCid: cid,        // certificate image CID (if you use IPFS)
        txHash: receipt.hash, // blockchain tx (for admin only)
        issuedAt: nowSec,
        revoked: false,       // new cert is active
      });

      setStatus(
        [
          "✅ Certificate issued successfully!",
          `CID: ${cid}`,
          `Transaction: ${txUrl(receipt.hash)}`,
          `Preview: ${gatewayUrl(cid)}`,
        ].join("\n")
      );

      setName("");
      setCourse("");
      setClassName("");
      setStudentWallet("");
      setCid("");
    } catch (err: any) {
      console.error(err);
      setIsError(true);
      setStatus("Error issuing certificate: " + (err?.message ?? String(err)));
    }
  }

  return (
    <section className="card">
      <h2>Teacher – Single Certificate</h2>
      <p>Issue a single blockchain certificate and store it in Admin Issued.</p>

      <div className="form-grid">
        <label>
          Student Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ali Raza"
          />
        </label>

        <label>
          Course
          <input
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Blockchain Fundamentals"
          />
        </label>

        <label>
          Class / Batch
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="BSCS-8A"
          />
        </label>

        <label>
          Student Wallet (optional)
          <input
            value={studentWallet}
            onChange={(e) => setStudentWallet(e.target.value.trim())}
            placeholder="0x..."
          />
        </label>

        <label className="cid-field">
          IPFS CID (certificate image / JSON)
          <input
            value={cid}
            onChange={(e) => setCid(e.target.value.trim())}
            placeholder="bafy... or Qm..."
          />
        </label>
      </div>

      <button className="btn btn-primary" onClick={handleIssue}>
        Issue Certificate
      </button>

      {status && (
        <pre className={`status ${isError ? "error" : ""}`}>{status}</pre>
      )}
    </section>
  );
}
