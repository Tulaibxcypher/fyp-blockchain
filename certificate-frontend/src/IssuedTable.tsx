import React, { useEffect, useMemo, useState } from "react";
import { getIssued, clearIssued, removeIssuedByCid, IssuedRecord } from "./libs/store";
import { gatewayUrl, txUrl } from "./libs/links";

function fmt(sec: number) {
  try { return new Date(sec * 1000).toLocaleString(); } catch { return String(sec); }
}

export default function IssuedTable() {
  const [rows, setRows] = useState<IssuedRecord[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { setRows(getIssued()); }, []);
  const refresh = () => setRows(getIssued());

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return rows;
    return rows.filter(r =>
      [r.cid, r.name, r.course, r.className, r.txHash]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(t)));
  }, [rows, q]);

  function onClear() {
    if (!rows.length) return;
    if (confirm("Clear all local issued records? (On-chain records remain)")) {
      clearIssued(); refresh();
    }
  }

  return (
    <section className="card">
      <h3>Issued (local)</h3>

      <div className="row" style={{marginBottom:12}}>
        <input className="input" placeholder="Search name / course / CID / tx"
               value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="btn btn-secondary" onClick={onClear}>Clear</button>
      </div>

      {!filtered.length ? (
        <div className="help">No records yet. Issue a certificate first.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Subject / Class</th>
                <th>Course</th>
                <th>CID</th>
                <th>Tx</th>
                <th>When</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.txHash + r.cid}>
                  <td>
                    {r.imageCid ? (
                      <img src={gatewayUrl(r.imageCid)} alt=""
                           style={{width:64,height:64,objectFit:"cover",borderRadius:8}}/>
                    ) : <div className="help">no image</div>}
                  </td>
                  <td>
                    <div>{r.name}</div>
                    {r.className ? <div className="help">Class: {r.className}</div> : null}
                  </td>
                  <td>{r.course}</td>
                  <td>
                    <a href={gatewayUrl(r.cid)} target="_blank" rel="noreferrer">
                      {r.cid.slice(0,8)}…{r.cid.slice(-6)}
                    </a>
                  </td>
                  <td>
                    <a href={txUrl(r.txHash)} target="_blank" rel="noreferrer">
                      {r.txHash.slice(0,8)}…{r.txHash.slice(-6)}
                    </a>
                  </td>
                  <td>{fmt(r.issuedAt)}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={()=>{removeIssuedByCid(r.cid); refresh();}}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
