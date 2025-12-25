import React, { useEffect, useState } from "react";
import axios from "axios";

export default function StorageTable({ cloud }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cloud) return;

    setLoading(true);
    setError(null);
    setData([]);

    axios
      .get(`http://localhost:8000/storage/${cloud}`)
      .then(response => {
        if (response.data?.error) {
          setError(response.data.error);
        } else {
          setData(response.data);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cloud]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!Array.isArray(data) || data.length === 0) return <p>No data</p>;

  const columns = Object.keys(data[0]);

   const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
      </div>
    );
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col}
              style={{
                borderBottom: "2px solid #ccc",
                textAlign: "left",
                padding: "8px"
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td
                key={col}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px"
                }}
              >
                {row[col] ?? "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
