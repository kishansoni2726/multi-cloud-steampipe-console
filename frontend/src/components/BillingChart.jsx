import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

export default function BillingChart({ cloud }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/billing/${cloud}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [cloud]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey={cloud === 'aws' ? 'service' : cloud === 'azure' ? 'service_name' : 'service'} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="cost" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
