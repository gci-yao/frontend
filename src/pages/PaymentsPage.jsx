import React, { useEffect, useState } from 'react'
import api from '../services/api'
// Import des icônes Heroicons
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CheckIcon, 
  XMarkIcon 
} from '@heroicons/react/24/solid';

import { PhoneIcon } from '@heroicons/react/24/outline';


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

  // -----------------------------
  // Confirmer un paiement
  // -----------------------------
  const confirm = async (id) => {
    await api.confirmPayment({ paymentId: id, token: localStorage.getItem('gh_token') })
    // On retire le paiement approuvé du filtre ou recharge la liste
    loadPayments()
  }

  // -----------------------------
  // Rejeter / Supprimer un paiement
  // -----------------------------
  const reject = async (id) => {
    const proceed = window.confirm("Do you really want to delete this payment?")
    if (!proceed) return

    // ⚡ Supprimer définitivement côté API
    await api.rejectPayment({ paymentId: id, token: localStorage.getItem('gh_token') })

    // ⚡ Retirer immédiatement du state
    setPayments((prev) => prev.filter(p => p.id !== id))
  }

  if (loading) return (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
  </div>
)


  // -----------------------------
  // Paiements filtrés pour la recherche / badge
  // -----------------------------
  // Paiements filtrés selon la recherche globale sur le téléphone
    const filteredPayments = payments.filter(p =>
      p.phone.toLowerCase().includes(filters.phone.toLowerCase())
    )

    // 🔹 Comptage dynamique par status
    const approvedCount = filteredPayments.filter(p => p.status === "approved").length
    const pendingCount = filteredPayments.filter(p => p.status === "pending").length
    const rejectedCount = filteredPayments.filter(p => p.status === "rejected").length


  return (
    
    <div>
          {/* Titre avec badge total */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl">Payments</h2>

        {/* 🔹 Approved */}
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
          {approvedCount}
        </div>

        {/* 🔹 Pending */}
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 text-white text-sm font-semibold">
          {pendingCount}
        </div>

        {/* 🔹 Rejected */}
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-sm font-semibold">
          {rejectedCount}
        </div>
      </div>



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
        <table className="w-full border-collapse">
            <thead className="text-slate-200 text-sm backdrop-blur-md bg-transparent border-b border-white/10">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Plan</th>
                <th className="px-3 py-2 text-left">Router</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-white/10 hover:bg-white/5 transition-colors duration-200">
                  <td className="px-3 py-2 text-white">{p.id}</td>

                  {/* 📞 PHONE */}
                  <td className="px-3 py-2 text-blue-400 inline-flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" />
                    {p.phone}
                  </td>

                  <td className="px-3 py-2 text-white">{p.amount} F</td>
                  <td className="px-3 py-2 text-white">
                    <span className="items-center gap-1 px-0 py-0 bg-green-300/10 text-green-300  rounded-full hover:text-green-700 transition-colors" >
                      {p.plan}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-white">{p.router?.name}</td>

                  {/* 🔥 STATUS BADGE */}
                  <td className="px-3 py-2">
                    {p.status === "approved" ? (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                        <CheckCircleIcon className="w-4 h-4" />
                        Approved
                      </div>
                    ) : p.status === "rejected" ? (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold">
                        <XCircleIcon className="w-4 h-4" />
                        Rejected
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-semibold">
                        <ClockIcon className="w-4 h-4" />
                        Pending
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-2 text-white">{new Date(p.created_at).toLocaleString()}</td>

                  {/* ⚡ ACTIONS */}
                  <td className="px-3 py-2 whitespace-nowrap inline-flex gap-2">
                    {p.status === "pending" && (
                      <>
                        <button
                          onClick={() => confirm(p.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500  rounded-full hover:text-green-700 transition-colors"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => reject(p.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-500  rounded-full hover:text-red-700 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-3 py-6 text-slate-400 text-center">
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
