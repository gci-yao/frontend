import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import StatsCard from '../../components/ui/StatsCard'
import ChartCard from '../../components/ui/ChartCard'
import { Link } from 'react-router-dom'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const token = localStorage.getItem('gh_token')

  const [stats, setStats] = useState(null)
  const [routers, setRouters] = useState([])
  const [payments, setPayments] = useState([])
  const [revenueHistory, setRevenueHistory] = useState([])
  const [planDistribution, setPlanDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const [minLoadingDone, setMinLoadingDone] = useState(false)

  // ⏱️ Loader minimum 3s
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingDone(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true)

      // 🔹 Stats réelles (boxes)
      const s = await api.getOwnerStats({ token })
      setStats(s)

      // 🔹 Routers
      const r = await api.getMyRouters({ token })
      setRouters(r || [])

      // 🔹 Paiements réels
      const p = await api.getPayments({ token })
      setPayments(p || [])

      // ✅ Filtrer uniquement les paiements approved pour les graphes
      const approvedPayments = (p || []).filter(pay => pay.status === 'approved')

      // ====== COURBE 1 : Revenue history (par jour) ======
      const revenueMap = {}
      approvedPayments.forEach(pay => {
        const day = new Date(pay.created_at).toLocaleDateString()
        revenueMap[day] = (revenueMap[day] || 0) + Number(pay.amount)
      })

      const revenueData = Object.entries(revenueMap)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, total]) => ({
          name: date,
          value: total
        }))

      setRevenueHistory(revenueData)

      // ====== COURBE 2 : Plan distribution ======
      const planMap = {}
      approvedPayments.forEach(pay => {
        const plan = pay.plan || 'Unknown'
        planMap[plan] = (planMap[plan] || 0) + 1
      })

      const planData = Object.entries(planMap).map(([plan, count]) => ({
        name: plan,
        value: count
      }))

      setPlanDistribution(planData)

    } catch (e) {
      console.error('Error loading dashboard:', e)

      setStats({
        revenueToday: 0,
        revenueThisMonth: 0,
        activeSessions: 0,
        pendingPayments: 0
      })
      setRouters([])
      setPayments([])
      setRevenueHistory([])
      setPlanDistribution([])
    } finally {
      setLoading(false)
    }
  }

  loadData()
}, [token])


  // 🔹 Loader animé
  if (loading || !minLoadingDone) {
    const text = "greenhat cloud home..."
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex gap-1 text-3xl font-bold tracking-widest">
          {text.split("").map((char, i) => (
            <span
              key={i}
              className="text-indigo-500 animate-zigzag"
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

  const noRouters = routers.length === 0

  return (
    <div>
      {/* ⚠️ Message info */}
      {noRouters && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-4 rounded-lg-soft">
          <strong>Aucun router configuré.</strong><br />
          Vous devez ajouter au moins un router pour commencer à accepter des paiements et voir des sessions.
          <div className="mt-3">
            <Link to="/routers" className="px-4 py-2 bg-primary text-black rounded-sm">
              ➕ Ajouter un router
            </Link>
          </div>
          <div className="mt-3 italic text-slate-500">
            Les pages <strong>Sessions</strong> et <strong>Payments</strong> sont désactivées tant qu’aucun router n’est configuré.
          </div>
        </div>
      )}

      {/* 📦 Stats réelles */}
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  <StatsCard title="Revenue today" value={stats ? `${stats.revenueToday} F` : '—'} />
  <StatsCard title="Revenue month" value={stats ? `${stats.revenueThisMonth} F` : '—'} />
  <StatsCard title="Active sessions" value={stats ? stats.activeSessions : '—'} />
  <StatsCard title="Pending payments" value={stats ? stats.pendingPayments : '—'} />
</div>

{/* 📈 Graphiques réels */}
<div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-6">
  <ChartCard
    title="Revenue history"
    data={revenueHistory}
    emptyText="Aucun paiement trouvé"
  />
  <ChartCard
    title="Plan distribution"
    data={planDistribution}
    emptyText="Aucune donnée de plan"
  />
</div>

{/* 🔗 Navigation */}
<div className="mt-6">
  <h3 className="text-lg sm:text-base">Router management</h3>
  <p className="text-slate-400 text-sm sm:text-xs">
    Manage your router fleet and health status in Routers page.
  </p>
  <Link
    to="/owner/activity"
    className="text-sm sm:text-xs text-primary hover:underline"
  >
    Go to see history →
  </Link>
</div>

{/* 🔹 Tables */}
<div className="overflow-x-auto rounded-lg border border-slate-800 mt-6">
  <table className="w-full text-left border-collapse">
    {/* ...thead et tbody inchangés */}
  </table>
</div>

    </div>
  )
}
