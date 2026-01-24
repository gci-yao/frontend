import React from 'react'
export default function StatsCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft neon border border-[rgba(37,211,102,0.04)] shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400">{title}</div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
      {subtitle && <div className="text-xs text-slate-400 mt-2">{subtitle}</div>}
    </div>
  )
}
