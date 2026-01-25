import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import StatsCard from '../../components/ui/StatsCard'
import ChartCard from '../../components/ui/ChartCard'
import { Link } from 'react-router-dom'

export default function SuperDashboard() {
  const [stats, setStats] = useState(null)
  const [businesses, setBusinesses] = useState([])

  useEffect(() => {
    api.getSuperStats(localStorage.getItem('gh_token')).then(setStats).catch(()=>{})
    api.getBusinesses(localStorage.getItem('gh_token')).then(setBusinesses).catch(()=>{})
  }, [])

  const approve = async (id) => {
    await api.approveBusiness({ businessId: id, token: localStorage.getItem('gh_token') })
    setBusinesses(await api.getBusinesses(localStorage.getItem('gh_token')))
  }

  const suspend = async (id) => {
    await api.suspendBusiness({ businessId: id, token: localStorage.getItem('gh_token') })
    setBusinesses(await api.getBusinesses(localStorage.getItem('gh_token')))
  }

  const revenueChartData = businesses.map((b, idx) => ({ name: b.name, value: Math.floor(Math.random() * 5000) }))

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <StatsCard title="Total revenue" value={stats ? `${stats.totalRevenue} F` : '—'} subtitle="Global" />
        <StatsCard title="Businesses" value={stats ? stats.totalBusinesses : '—'} subtitle="Total registered" />
        <StatsCard title="Active sessions" value={stats ? stats.activeSessions : '—'} />
        <StatsCard title="Monthly growth" value={stats ? `${stats.monthlyGrowth}%` : '—'} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <ChartCard title="Revenue per business" data={revenueChartData} dataKey="value" xKey="name" />
        <ChartCard title="Revenue over time" data={[{name:'Jan', value:400},{name:'Feb',value:600},{name:'Mar',value:900}]} />
      </div>

      <div className="mt-6 bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
              <Link
                  to="/super/history"
                  className="text-sm text-primary hover:underline"
                >
                  Go to see history →
                </Link>
        <h3 className="text-lg mb-3">Businesses</h3>
        <table className="w-full text-left">
          <thead className="text-slate-400 text-sm">
            <tr><th>Name</th><th>Owner</th><th>Commission</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id} className="border-t border-slate-800">
                <td className="py-3">{b.name}</td>
                <td>{b.owner.first_name}</td>
                <td>{b.commission}%</td>
                <td className="capitalize">{b.status}</td>
                <td>
                  <button onClick={() => approve(b.id)} className="mr-2 px-3 py-1 bg-primary text-black rounded-sm">Approve</button>
                  <button onClick={() => suspend(b.id)} className="px-3 py-1 bg-red-600 text-white rounded-sm">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  )
}
