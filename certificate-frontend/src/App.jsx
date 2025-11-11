import React, { useState } from "react";
import Single from "./Single";
import Verify from "./Verify";
import IssuedTable from "./IssuedTable";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("single");

  return (
    <div className="container">
      <header className="header">
        <div className="title">Blockchain Certificate System</div>
        <div className="network">Polygon Amoy</div>
      </header>

      <nav className="tabs">
        <button className={`tab ${tab === "single" ? "active" : ""}`} onClick={() => setTab("single")}>Single</button>
        <button className={`tab ${tab === "verify" ? "active" : ""}`} onClick={() => setTab("verify")}>Verify</button>
        <button className={`tab ${tab === "issued" ? "active" : ""}`} onClick={() => setTab("issued")}>Issued</button>
      </nav>

      {tab === "single" && <Single />}
      {tab === "verify" && <Verify />}
      {tab === "issued" && <IssuedTable />}
    </div>
  );
}
