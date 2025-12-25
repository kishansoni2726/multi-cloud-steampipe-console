import React, { useState } from "react";
import StorageTable from "./components/StorageTable";
import ComputeTable from "./components/ComputeTable";
import BillingChart from "./components/BillingChart";

export default function App() {
  const [activeTab, setActiveTab] = useState("storage");

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      padding: '0'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 40px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: '600',
          color: '#1a202c'
        }}>
          Multi-Cloud Console
        </h1>
        <p style={{
          margin: '5px 0 0 0',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Manage your AWS, Azure, and GCP resources
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '2px solid #e5e7eb',
        padding: '0 40px',
        display: 'flex',
        gap: '8px'
      }}>
        {[
          { id: 'storage', label: 'Storage', icon: '💾' },
          { id: 'compute', label: 'Compute', icon: '🖥️' },
          { id: 'billing', label: 'Billing', icon: '💰' },
          { id: 'cost-savings', label: 'Cost Savings', icon: '📉' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '16px 24px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #4f46e5' : '3px solid transparent',
              color: activeTab === tab.id ? '#4f46e5' : '#6b7280',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '40px' }}>
        {activeTab === "storage" && <StorageContent />}
        {activeTab === "compute" && <ComputeContent />}
        {activeTab === "billing" && <BillingContent />}
        {activeTab === "cost-savings" && <CostSavingsContent />}
      </div>
    </div>
  );
}

/* ========== Storage Tab ========== */
function StorageContent() {
  return (
    <>
      <CloudSection title="AWS S3 Buckets" icon="🟠" color="#FF9900">
        <StorageTable cloud="aws" />
      </CloudSection>

      <CloudSection title="Azure Storage Accounts" icon="🔵" color="#0078D4">
        <StorageTable cloud="azure" />
      </CloudSection>

      <CloudSection title="GCP Storage Buckets" icon="🔴" color="#4285F4">
        <StorageTable cloud="gcp" />
      </CloudSection>
    </>
  );
}

/* ========== Compute Tab ========== */
function ComputeContent() {
  return (
    <>
      <CloudSection title="AWS EC2 Instances" icon="🟠" color="#FF9900">
        <ComputeTable cloud="aws" />
      </CloudSection>

      <CloudSection title="Azure Virtual Machines" icon="🔵" color="#0078D4">
        <ComputeTable cloud="azure" />
      </CloudSection>

      <CloudSection title="GCP Compute Engine" icon="🔴" color="#4285F4">
        <ComputeTable cloud="gcp" />
      </CloudSection>
    </>
  );
}

/* ========== Billing Tab ========== */
function BillingContent() {
  return (
    <>
      <CloudSection title="AWS Billing" icon="🟠" color="#FF9900">
        <BillingChart cloud="aws" />
      </CloudSection>

      <CloudSection title="Azure Billing" icon="🔵" color="#0078D4">
        <BillingChart cloud="azure" />
      </CloudSection>

      <CloudSection title="GCP Billing" icon="🔴" color="#4285F4">
        <BillingChart cloud="gcp" />
      </CloudSection>
    </>
  );
}

/* ========== Cost Savings Tab ========== */
function CostSavingsContent() {
  return (
    <>
      <CloudSection 
        title="Unused Elastic IPs (AWS)" 
        icon="💡" 
        color="#f59e0b"
        description="Elastic IPs not associated with running instances"
      >
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px' }}>
          <p>Coming soon: Unused EIP detection</p>
        </div>
      </CloudSection>

      <CloudSection 
        title="Unattached EBS Volumes (AWS)" 
        icon="💿" 
        color="#ef4444"
        description="EBS volumes not attached to any instance"
      >
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px' }}>
          <p>Coming soon: Unattached volume detection</p>
        </div>
      </CloudSection>

      <CloudSection 
        title="Idle Virtual Machines" 
        icon="😴" 
        color="#8b5cf6"
        description="VMs with low CPU utilization"
      >
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px' }}>
          <p>Coming soon: Idle VM detection</p>
        </div>
      </CloudSection>
    </>
  );
}

/* ========== Cloud Section Component ========== */
function CloudSection({ title, icon, color, description, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '15px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: color,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          {icon}
        </div>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a202c'
          }}>
            {title}
          </h2>
          {description && (
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}