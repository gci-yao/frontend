import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import StatsCard from '../../components/ui/StatsCard'
import ChartCard from '../../components/ui/ChartCard'
import { Link } from 'react-router-dom'

export default function SuperDashboard() {
  const [stats, setStats] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [payments, setPayments] = useState([]) // ⚡ Paiements inclus rejetés

  const [revenuePerBusiness, setRevenuePerBusiness] = useState([])
  const [revenueOverTime, setRevenueOverTime] = useState([])

  const [loading, setLoading] = useState(true)
  const [minLoadingDone, setMinLoadingDone] = useState(false)

  // ⏱️ Loader animation
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingDone(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('gh_token')

        const [statsRes, businessesRes, paymentsRes] = await Promise.all([
          api.getSuperStats(token),
          api.getBusinesses(token),
          api.getPayments({ token }) // ⚡ Récupère tous les paiements, y compris rejetés
        ])

        setStats(statsRes || {})
        setBusinesses(businessesRes || [])
        setPayments(paymentsRes || [])

        // =========================
        // Revenue par business
        // =========================
        const perBusiness = {}
        const perMonth = {}

        paymentsRes.forEach(p => {
          if (!p.business || !p.amount || p.status !== 'approved') return
          const name = p.business.name
          perBusiness[name] = (perBusiness[name] || 0) + Number(p.amount)

          if (!p.created_at) return
          const date = new Date(p.created_at)
          const key = date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' })
          perMonth[key] = (perMonth[key] || 0) + Number(p.amount)
        })

        setRevenuePerBusiness(
          Object.entries(perBusiness).map(([name, value]) => ({ name, value }))
        )

        // =========================
        // Revenue over time cumulatif
        // =========================
        const sortedMonths = Object.entries(perMonth)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => new Date(a.name + " 1") - new Date(b.name + " 1"))

        let cumulative = 0
        setRevenueOverTime(
          sortedMonths.map(d => {
            cumulative += d.value
            return { ...d, value: cumulative }
          })
        )

      } catch (err) {
        console.error("Dashboard load error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const approve = async (id) => {
    await api.approveBusiness({ businessId: id, token: localStorage.getItem('gh_token') })
    setBusinesses(await api.getBusinesses(localStorage.getItem('gh_token')))
  }

  const suspend = async (id) => {
    await api.suspendBusiness({ businessId: id, token: localStorage.getItem('gh_token') })
    setBusinesses(await api.getBusinesses(localStorage.getItem('gh_token')))
  }

  // ⚡ Supprimer définitivement un paiement rejeté
  const deleteRejectedPayment = async (id) => {
    const proceed = window.confirm("Do you really want to delete this payment?")
    if (!proceed) return

    await api.rejectPayment({ paymentId: id, token: localStorage.getItem('gh_token') })
    setPayments((prev) => prev.filter(p => p.id !== id))
  }

  if (loading || !minLoadingDone) {
    const text = "greenhat cloud home..."
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex gap-1 text-3xl font-bold tracking-widest">
          {text.split("").map((char, i) => (
            <span
              key={i}
              className={`text-cyan-200 animate-zigzag`}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "1.2s",
                transform: i % 2 === 0 ? "translateY(-8px)" : "translateY(8px)"
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard title="Total revenue" value={stats ? `${stats.totalRevenue} F` : '—'} subtitle="Global" />
        <StatsCard title="Businesses" value={stats ? stats.totalBusinesses : '—'} subtitle="Total registered" />
        <StatsCard title="Active sessions" value={stats ? stats.activeSessions : '—'} />
        <StatsCard title="Monthly growth" value={stats ? `${stats.monthlyGrowth}%` : '—'} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <ChartCard title="Revenue per business" data={revenuePerBusiness} dataKey="value" xKey="name" />
        <ChartCard title="Revenue over time" data={revenueOverTime} dataKey="value" xKey="name" />
      </div>

      {/* BUSINESSES TABLE */}
      <div className="mt-6 bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
        <Link to="/super/history" className="text-sm text-primary hover:underline">
          Go to see history →
        </Link>

        <h3 className="text-lg mb-3">Businesses</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-4 py-3 rounded-tl-lg">Name</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {businesses.map(b => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{b.name}</td>
                  <td className="px-4 py-3 text-slate-300">{b.owner?.first_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400">
                      {b.commission}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                      ${b.status === 'approved' ? 'bg-green-500/10 text-green-400'
                        : b.status === 'suspended' ? 'bg-red-500/10 text-red-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => approve(b.id)} className="px-3 py-1.5 text-xs font-semibold bg-primary text-black rounded-md hover:opacity-90 transition">Approve</button>
                      <button onClick={() => suspend(b.id)} className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-500 transition">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECTED PAYMENTS TABLE */}
      <div className="mt-6 bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
        <h3 className="text-lg mb-3">Rejected Payments</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Router</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.filter(p => p.status === 'rejected').map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3">{p.phone}</td>
                  <td className="px-4 py-3">{p.amount} F</td>
                  <td className="px-4 py-3">{p.plan}</td>
                  <td className="px-4 py-3">{p.router?.name}</td>
                  <td className="px-4 py-3">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteRejectedPayment(p.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-500 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {payments.filter(p => p.status === 'rejected').length === 0 && (
                <tr>
                  <td colSpan="7" className="px-3 py-6 text-slate-400 text-center">
                    No rejected payments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
