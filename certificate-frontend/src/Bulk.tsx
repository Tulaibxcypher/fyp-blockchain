// src/Bulk.tsx
import React, { useState } from "react";
import { ethers } from "ethers";
import { resolveCertificate } from "./ethers-client";

export default function Bulk() {
  const [rowsText, setRowsText] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

  /*
    Expected format (one per line):
    name,course,className,cid,studentWallet

    Example:
    Ali Raza,Blockchain,BSCS-8A,bafy123...,0x1234...
    Hina Khan,AI,BSCS-8B,bafy456...,0x5678...
  */

  async function handleBulkIssue() {
    try {
      setIsError(false);
      setStatus("Parsing input...");

      const lines = rowsText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (!lines.length) {
        setIsError(true);
        setStatus("Please paste at least one line.");
        return;
      }

      const names: string[] = [];
      const courses: string[] = [];
      const classes: string[] = [];
      const cids: string[] = [];
      const wallets: string[] = [];

      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 4) {
          throw new Error("Each line must have at least 4 values.");
        }
        const [name, course, className, cid, wallet] = parts;

        if (!name || !course || !className || !cid) {
          throw new Error("Missing values in: " + line);
        }

        names.push(name);
        courses.push(course);
        classes.push(className);
        cids.push(cid);

        if (wallet && ethers.isAddress(wallet)) {
          wallets.push(wallet);
        } else {
          wallets.push(ethers.ZeroAddress);
        }
      }

      setStatus("Connecting to contract...");
      const cert = await resolveCertificate();

      setStatus("Sending bulk transaction (confirm in MetaMask)...");
      const tx = await cert.addCertificates(
        names,
        courses,
        classes,
        cids,
        wallets
      );
      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("✅ Bulk certificates issued successfully!");
    } catch (err: any) {
      console.error(err);
      setIsError(true);
      setStatus("Error in bulk issue: " + (err?.message ?? String(err)));
    }
  }

  return (
    <section className="card">
      <h2>Teacher – Bulk Certificates</h2>
      <p>
        Paste multiple rows (name,course,className,cid,studentWallet). Wallet is
        optional.
      </p>

      <textarea
        rows={8}
        value={rowsText}
        onChange={(e) => setRowsText(e.target.value)}
        placeholder="Ali Raza,Blockchain,BSCS-8A,bafy...,0x1234...
Hina Khan,AI,BSCS-8B,bafy...,0x5678..."
      />

      <button className="btn btn-primary" onClick={handleBulkIssue}>
        Issue All
      </button>

      {status && (
        <pre className={`status ${isError ? "error" : ""}`}>{status}</pre>
      )}
    </section>
  );
}
