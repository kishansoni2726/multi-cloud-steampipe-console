import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import axios from "axios";

export default function BillingChart({ cloud }) {
  const [data, setData] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:8000/billing/${cloud}`
        );

        setData(response.data.services || []);
        setTotalCost(response.data.total_cost || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cloud]);

  /* ---------- Helpers ---------- */

const CustomYAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach(word => {
    if ((currentLine + word).length > 22) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  });

  if (currentLine) lines.push(currentLine);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-10}
        y={0}
        textAnchor="end"
        fill="#374151"
        fontSize={12}
      >
        {lines.map((line, index) => (
          <tspan key={index} x={-10} dy={index === 0 ? 4 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};


  const sortedData = [...data].sort((a, b) => b.cost - a.cost);

  let chartData = sortedData.slice(0, 10);

  if (chartData.length < 10) {
    const existing = new Set(chartData.map(s => s.service));
    const zeroCost = sortedData
      .filter(s => s.cost === 0 && !existing.has(s.service))
      .slice(0, 10 - chartData.length);

    chartData = [...chartData, ...zeroCost];
  }

  const topService = chartData[0];

  /* ---------- Tooltip ---------- */

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const { service, cost } = payload[0].payload;

    return (
      <div
        style={{
          background: "#111827",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "260px"
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{service}</div>
        <div>${cost.toFixed(2)}</div>
      </div>
    );
  };

  /* ---------- States ---------- */

  if (loading) return <div style={{ textAlign: "center" }}>Loading…</div>;
  if (error)
    return (
      <div style={{ textAlign: "center", color: "red" }}>
        Error: {error}
      </div>
    );

  if (!chartData.length)
    return <div style={{ textAlign: "center" }}>No billing data</div>;

  /* ---------- Render ---------- */

  return (
    <div
      style={{
        background: "#f9fafb",
        padding: 24,
        borderRadius: 16
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>
        {cloud.toUpperCase()} Billing — Current Month
      </h2>

      {/* KPI CARDS */}
      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          marginBottom: 32,
          flexWrap: "wrap"
        }}
      >
        <KpiCard title="Total Cost" value={`$${totalCost.toFixed(2)}`} />
        <KpiCard title="Services Used" value={chartData.length} />
        <KpiCard
          title="Top Service"
          value={`${topService.service} ($${topService.cost.toFixed(2)})`}
        />
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="service"
            width={200}
            tick={<CustomYAxisTick />}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="cost" name="Cost (USD)" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.cost === 0
                    ? "#e5e7eb"
                    : index === 0
                    ? "#ef4444"
                    : "#4f46e5"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- KPI Card ---------- */

function KpiCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "16px 24px",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: 200,
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: 14, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
}
