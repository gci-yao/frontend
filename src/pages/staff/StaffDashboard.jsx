import React from 'react'

export default function StaffDashboard() {
  return (
    <div>
      <h2 className="text-2xl">Staff Panel</h2>
      <p className="text-slate-400">Limited access to payments and sessions.</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">Payments quick view</div>
        <div className="bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">Sessions quick view</div>
      </div>
    </div>
  )
}
