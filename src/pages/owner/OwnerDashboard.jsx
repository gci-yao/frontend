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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // 🔹 Récupérer les routers
        const r = await api.getMyRouters({ token })
        setRouters(r || [])

        // 🔹 S'il n'y a pas de router, stats = 0
        if (!r || r.length === 0) {
          setStats({
            revenueToday: 0,
            revenueThisMonth: 0,
            activeSessions: 0,
            pendingPayments: 0
          })
        } else {
          const s = await api.getOwnerStats({ token })
          setStats(s)
        }
      } catch (e) {
        console.error('Error loading dashboard:', e)
        setStats({
          revenueToday: 0,
          revenueThisMonth: 0,
          activeSessions: 0,
          pendingPayments: 0
        })
        setRouters([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  // 🔹 Exemple de données fictives pour les graphiques
  const revenueHistory = Array.from({ length: 6 }).map((_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 200)
  }))

  // 🔹 Affichage pendant le chargement
  if (loading) return <div className="text-slate-400">Loading…</div>

  // 🔹 Vérification router une seule fois
  const noRouters = routers.length === 0

  return (
    <div>
      {/* 👉 Message unique si aucun router */}
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard title="Revenue today" value={stats ? `${stats.revenueToday} F` : '—'} />
        <StatsCard title="Revenue month" value={stats ? `${stats.revenueThisMonth} F` : '—'} />
        <StatsCard title="Active sessions" value={stats ? stats.activeSessions : '—'} />
        <StatsCard title="Pending payments" value={stats ? stats.pendingPayments : '—'} />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <ChartCard title="Revenue history" data={revenueHistory} />
        <ChartCard
          title="Plan distribution"
          data={[
            { name: '200F', value: 30 },
            { name: '500F', value: 50 },
            { name: '1000F', value: 20 }
          ]}
        />
      </div>

      {/* Gestion des routers */}
      <div className="mt-6">
        <h3 className="text-lg">Router management</h3>
        <p className="text-slate-400">
          Manage your router fleet and health status in Routers page.
        </p>
        <Link
  to="/owner/activity"
  className="text-sm text-primary hover:underline"
>
  Voir tout l’historique →
</Link>

      </div>
    </div>
  )
}
