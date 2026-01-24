import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [filters, setFilters] = useState({ status: '', phone: '' })
  const [routers, setRouters] = useState([])
  const [loading, setLoading] = useState(true)

  // -----------------------------
  // Charger les routers
  // -----------------------------
  const loadRouters = async () => {
    const r = await api.getRouters({ token: localStorage.getItem('gh_token') })
    setRouters(r || [])
  }

  const loadPayments = async () => {
    const list = await api.getPayments({
      token: localStorage.getItem('gh_token'),
      filters
    })
    setPayments(list)
  }

  useEffect(() => {
    const init = async () => {
      await loadRouters()
      await loadPayments()
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    loadPayments()
  }, [filters])

  const confirm = async (id) => {
    await api.confirmPayment({ paymentId: id, token: localStorage.getItem('gh_token') })
    loadPayments()
  }

  const reject = async (id) => {
    await api.rejectPayment({ paymentId: id, token: localStorage.getItem('gh_token') })
    loadPayments()
  }

  if (loading) return <div className="text-slate-400">Chargement…</div>

  return (
    <div>
      <h2 className="text-2xl">Payments</h2>

      {routers.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-4 rounded-lg-soft">
          <strong>Aucun router configuré.</strong><br />
          Vous devez ajouter un router pour voir les paiements.
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-slate-800 p-2 rounded-md"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          value={filters.phone}
          onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
          placeholder="Search phone"
          className="bg-slate-800 p-2 rounded-md"
        />
      </div>

      <div className="mt-4 bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
        <table className="w-full">
          <thead className="text-slate-400 text-sm">
            <tr>
              <th>ID</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Plan</th>
              <th>Router</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-slate-800">
                <td>{p.id}</td>
                <td>{p.phone}</td>
                <td>{p.amount} F</td>
                <td>{p.plan}</td>
                <td>{p.router?.name}</td>
                <td
                  className={
                    p.status === 'approved'
                      ? 'text-green-400'
                      : p.status === 'rejected'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }
                >
                  {p.status}
                </td>
                <td>{new Date(p.created_at).toLocaleString()}</td>
                <td>
                  {p.status === 'pending' && (
                    <>
                      <button
                        onClick={() => confirm(p.id)}
                        className="mr-2 px-3 py-1 bg-primary text-black rounded-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(p.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="8" className="py-6 text-slate-400">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
