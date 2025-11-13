import React, { useState } from "react";
import { ethers } from "ethers";
import { resolveCertificate } from "./ethers-client";
import { pushIssued } from "./libs/store";

export default function Bulk() {
  const [bulkText, setBulkText] = useState("");
  const [status, setStatus] = useState("");

  const handleIssue = async () => {
    setStatus("");

    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setStatus("❗ Please paste at least one line.");
      return;
    }

    const names: string[] = [];
    const courses: string[] = [];
    const classes: string[] = [];
    const cids: string[] = [];
    const wallets: string[] = []; // will be all ZeroAddress

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(",").map((p) => p.trim());

      // Expected format: name,course,className,cid
      if (parts.length < 4) {
        setStatus(
          `❗ Line ${i + 1} is invalid. Expected format: name,course,className,cid`
        );
        return;
      }

      const [name, course, className, cid] = parts;

      if (!name || !course || !cid) {
        setStatus(
          `❗ Line ${i + 1} is missing required fields (name, course, cid).`
        );
        return;
      }

      names.push(name);
      courses.push(course);
      classes.push(className || "");
      cids.push(cid);
      wallets.push(ethers.ZeroAddress); // no wallet support in bulk
    }

    try {
      setStatus("⏳ Connecting to MetaMask...");

      const cert = await resolveCertificate();

      setStatus("⏳ Sending bulk transaction...");

      const tx = await cert.addCertificates(
        names,
        courses,
        classes,
        cids,
        wallets
      );

      setStatus("⏳ Waiting for confirmation...");
      const receipt = await tx.wait();

      const nowSec = Math.floor(Date.now() / 1000);

      // Save each issued cert into Admin – Issued (local)
      for (let i = 0; i < cids.length; i++) {
        pushIssued({
          cid: cids[i],
          name: names[i],
          course: courses[i],
          className: classes[i] || "",
          imageCid: cids[i],
          txHash: receipt.hash,
          issuedAt: nowSec,
          revoked: false,
        });
      }

      setStatus(
        `✅ Successfully issued ${cids.length} certificates.
Tx: ${receipt.hash}`
      );

      setBulkText("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error issuing bulk certificates.");
    }
  };

  return (
    <div>
      <h2>Teacher – Bulk Certificates</h2>
      <p>
        Paste multiple rows in this format:
        <br />
        <code>name,course,className,cid</code>
      </p>

      <textarea
        style={{ marginTop: "10px", width: "400px", height: "160px" }}
        placeholder={`Ali Raza,Blockchain Fundamentals,BSCS-8A,Qm...\nHina Khan,AI,BSCS-8B,Qm...`}
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
      />

      <div>
        <button
          style={{
            marginTop: "10px",
            padding: "8px 18px",
            background: "black",
            color: "white",
            borderRadius: "8px",
          }}
          onClick={handleIssue}
        >
          Issue All
        </button>
      </div>

      {status && (
        <pre
          style={{
            marginTop: "16px",
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
