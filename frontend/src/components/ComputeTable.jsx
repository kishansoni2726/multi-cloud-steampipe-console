import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ComputeTable({ cloud }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);

    axios
      .get(`http://localhost:8000/compute/${cloud}`)
      .then(response => setData(response.data))
      .catch(err => setError(err.message));
  }, [cloud]);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!data) return <p>Loading…</p>;
  if (!Array.isArray(data) || data.length === 0) return <p>No data</p>;

  const columns = Object.keys(data[0]);

  return (
    <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col} style={{ borderBottom: "1px solid #ccc" }}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td key={col} style={{ borderBottom: "1px solid #eee" }}>
                {row[col] ?? "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
