import React from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function ChartCard({ title, data, dataKey = 'value', xKey = 'name' }) {
  return (
    <div className="bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft neon border border-[rgba(37,211,102,0.04)] shadow-soft">
      <div className="mb-2 text-sm text-slate-400">{title}</div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey={xKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke="#25D366" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
