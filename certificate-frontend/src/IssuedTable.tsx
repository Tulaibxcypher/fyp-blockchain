// src/IssuedTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getIssued,
  clearIssued,
  removeIssuedByCid,
  setRevoked,
  IssuedRecord,
} from "./libs/store";
import { gatewayUrl, txUrl } from "./libs/links";

function fmt(sec: number) {
  try {
    return new Date(sec * 1000).toLocaleString();
  } catch {
    return String(sec);
  }
}

export default function IssuedTable() {
  const [rows, setRows] = useState<IssuedRecord[]>([]);
  const [q, setQ] = useState("");

  const refresh = () => setRows(getIssued());

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        r.cid.toLowerCase().includes(term) ||
        r.name.toLowerCase().includes(term) ||
        r.course.toLowerCase().includes(term) ||
        (r.className ?? "").toLowerCase().includes(term)
    );
  }, [rows, q]);

  return (
    <section className="card">
      <h2>Admin – Issued Certificates (Local)</h2>

      <div className="toolbar">
        <input
          placeholder="Search (name, course, CID...)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="btn btn-secondary"
          onClick={() => {
            clearIssued();
            refresh();
          }}
        >
          Clear All (Local)
        </button>
      </div>

      {!filtered.length ? (
        <p>No certificates stored yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Student</th>
                <th>Course</th>
                <th>Class</th>
                <th>CID</th>
                <th>Issued At</th>
                <th>Status</th>
                <th>Tx</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const imgUrl = r.imageCid ? gatewayUrl(r.imageCid) : "";
                const txLink = r.txHash ? txUrl(r.txHash) : "";

                return (
                  <tr key={r.cid}>
                    <td>
                      {imgUrl && (
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open certificate image"
                        >
                          <img
                            src={imgUrl}
                            alt="cert"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        </a>
                      )}
                    </td>
                    <td>{r.name}</td>
                    <td>{r.course}</td>
                    <td>{r.className ?? "-"}</td>
                    <td style={{ maxWidth: 160, wordBreak: "break-all" }}>
                      {r.cid}
                    </td>
                    <td>{fmt(r.issuedAt)}</td>
                    <td>{r.revoked ? "❌ Revoked" : "✅ Active"}</td>
                    <td>
                      {txLink && (
                        <a href={txLink} target="_blank" rel="noreferrer">
                          View Tx
                        </a>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setRevoked(r.cid, !r.revoked);
                          refresh();
                        }}
                      >
                        {r.revoked ? "Restore" : "Revoke"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ marginLeft: 8 }}
                        onClick={() => {
                          removeIssuedByCid(r.cid);
                          refresh();
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
