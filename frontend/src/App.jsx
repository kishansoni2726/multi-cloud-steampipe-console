import React, { useState } from "react";
import StorageTable from "./components/StorageTable";
import ComputeTable from "./components/ComputeTable"; // EC2 table component
import BillingChart from "./components/BillingChart";   // optional billing chart

export default function App() {
  const [activeTab, setActiveTab] = useState("storage"); // default tab

  return (
    <div style={{ padding: 20 }}>
      <h1>Multi-Cloud Console</h1>

      {/* Tab Buttons */}
      <div style={{ display: "flex", marginBottom: 20, width: "100%" }}>
        <button
          onClick={() => setActiveTab("storage")}
          style={{
            flex: 1,
            padding: 10,
            fontSize: 16,
            cursor: "pointer",
            backgroundColor: activeTab === "storage" ? "#ddd" : "#f0f0f0",
            border: "1px solid #000"
          }}
        >
          Storage
        </button>
        <button
          onClick={() => setActiveTab("compute")}
          style={{
            flex: 1,
            padding: 10,
            fontSize: 16,
            cursor: "pointer",
            backgroundColor: activeTab === "compute" ? "#ddd" : "#f0f0f0",
            border: "1px solid #000"
          }}
        >
          Compute (EC2)
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          style={{
            flex: 1,
            padding: 10,
            fontSize: 16,
            cursor: "pointer",
            backgroundColor: activeTab === "billing" ? "#ddd" : "#f0f0f0",
            border: "1px solid #000"
          }}
        >
          Billing
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "storage" && (
        <>
          <h2>AWS S3</h2>
          <StorageTable cloud="aws" />

          <h2>Azure Storage Accounts</h2>
          <StorageTable cloud="azure" />

          <h2>GCP Storage Buckets</h2>
          <StorageTable cloud="gcp" />

          <h2>All Clouds</h2>
          <StorageTable cloud="all" />
        </>
      )}

      {activeTab === "compute" && (
        <>
          <h2>AWS EC2 Instances</h2>
          <ComputeTable cloud="aws" />
        </>
      )}

      {activeTab === "billing" && (
        <>
          <h2>AWS Billing</h2>
          <BillingChart cloud="aws" />

          <h2>Azure Billing</h2>
          <BillingChart cloud="azure" />

          <h2>GCP Billing</h2>
          <BillingChart cloud="gcp" />

          <h2>All Clouds</h2>
          <BillingChart cloud="all" />
        </>
      )}
    </div>
  );
}
