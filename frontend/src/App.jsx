import React from "react";
import StorageTable from "./components/StorageTable";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Multi-Cloud Storage Inventory</h1>

      <h2>AWS S3</h2>
      <StorageTable cloud="aws" />

      <h2>Azure Storage Accounts</h2>
      <StorageTable cloud="azure" />

      <h2>GCP Storage Buckets</h2>
      <StorageTable cloud="gcp" />

      <h2>All Clouds</h2>
      <StorageTable cloud="all" />
    </div>
  );
}
