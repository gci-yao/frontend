import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-2 gap-8">
        <div className="p-8 rounded-lg-soft neon bg-[rgba(6,10,14,0.65)] shadow-soft">
          <h1 className="text-4xl font-bold text-white">GreenHatah Cloud</h1>
          <p className="mt-4 text-slate-300">Manage multiple Wi‑Fi hotspot businesses, revenue sharing, subscriptions and router fleets — all from one place.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/login" className="px-4 py-2 bg-primary text-black rounded-md font-semibold">Login</Link>
            <Link to="/register" className="px-4 py-2 border border-slate-700 rounded-md text-slate-300">Register</Link>
          </div>
        </div>
        <div className="p-8 rounded-lg-soft neon bg-[rgba(6,10,14,0.65)] shadow-soft">
          <h3 className="text-xl text-slate-300">Features</h3>
          <div className="mt-4 grid gap-4">
            <div className="p-3 bg-[rgba(10,14,18,0.6)] rounded-lg">Role-based dashboards</div>
            <div className="p-3 bg-[rgba(10,14,18,0.6)] rounded-lg">Auto-triggered sessions from payments</div>
          </div>
        </div>
      </div>
    </div>
  )
}
