import React, { useState } from "react";
import { ethers } from "ethers";
import { resolveCertificate } from "./ethers-client";
import { pushIssued } from "./libs/store";

export default function Single() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [className, setClassName] = useState(""); // OPTIONAL
  const [studentWallet, setStudentWallet] = useState("");
  const [cid, setCid] = useState("");
  const [status, setStatus] = useState("");

  const issueCertificate = async () => {
    setStatus("");

    // ---------- VALIDATION ----------
    if (!name || !course || !cid) {
      setStatus("❗ Please enter Student Name, Course, and CID.");
      return;
    }

    // Validate wallet only if provided
    let issuedTo = ethers.ZeroAddress;
    const trimmedWallet = studentWallet.trim();
    if (trimmedWallet !== "") {
      if (!ethers.isAddress(trimmedWallet)) {
        setStatus("❗ Invalid student wallet address.");
        return;
      }
      issuedTo = trimmedWallet;
    }

    try {
      setStatus("⏳ Connecting to MetaMask...");

      // NOTE: your ethers-client.js defines resolveCertificate() with NO arguments
      const cert = await resolveCertificate();

      setStatus("⏳ Sending transaction...");

      const tx = await cert.addCertificate(
        name,
        course,
        className || "", // pass empty string if not provided
        cid,
        issuedTo
      );

      setStatus("⏳ Waiting for confirmation...");
      const receipt = await tx.wait();

      const nowSec = Math.floor(Date.now() / 1000);

      // Save into local admin-issued storage
      pushIssued({
        cid,
        name,
        course,
        className: className || "",
        imageCid: cid,
        txHash: receipt.hash,
        issuedAt: nowSec,
        revoked: false,
      });

      setStatus(
        `✅ Certificate Issued Successfully!
Tx: ${receipt.hash}
CID: ${cid}`
      );

      // Clear fields
      setName("");
      setCourse("");
      setClassName("");
      setStudentWallet("");
      setCid("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error issuing certificate.");
    }
  };

  return (
    <div>
      <h2>Teacher – Single Certificate</h2>
      <p>Issue a single blockchain certificate and store it in Admin Issued.</p>

      <div style={{ marginTop: "20px" }}>
        <label>
          Student Name:
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ali Raza"
          />
        </label>

        <label style={{ marginLeft: "10px" }}>
          Course:
          <input
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Blockchain Fundamentals"
          />
        </label>

        <label style={{ marginLeft: "10px" }}>
          Class / Batch (optional):
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="BSCS-8A (optional)"
          />
        </label>

        <label style={{ marginLeft: "10px" }}>
          Student Wallet (optional):
          <input
            value={studentWallet}
            onChange={(e) => setStudentWallet(e.target.value)}
            placeholder="0x..."
          />
        </label>

        <label style={{ marginLeft: "10px" }}>
          IPFS CID:
          <input
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            placeholder="bafy... or Qm..."
          />
        </label>
      </div>

      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "black",
          color: "white",
          borderRadius: "8px",
        }}
        onClick={issueCertificate}
      >
        Issue Certificate
      </button>

      {status && (
        <pre
          style={{
            marginTop: "20px",
            whiteSpace: "pre-wrap",
            padding: "10px",
            background: "#f8f8f8",
            borderRadius: "8px",
          }}
        >
          {status}
        </pre>
      )}
    </div>
  );
}
