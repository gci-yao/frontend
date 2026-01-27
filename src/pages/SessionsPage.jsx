import React, { useEffect, useState } from 'react'
import api from '../services/api'
import {
  ArrowPathIcon,
  StopCircleIcon,
  PhoneIcon,
  CpuChipIcon,
  WifiIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([])
  const [routers, setRouters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("") // <-- état pour la recherche
  const [expiredNotifs, setExpiredNotifs] = useState([]) // <-- notifications expiration

  const loadRouters = async () => {
    const r = await api.getRouters({ token: localStorage.getItem('gh_token') })
    setRouters(r || [])
  }

  const loadSessions = async () => {
    const s = await api.getSessions({ token: localStorage.getItem('gh_token') })
    const now = Date.now()

    // 🔒 Normalisation : une session expirée reste expirée
    const normalized = (s || []).map(sess => {
      const end = new Date(sess.end_time).getTime()
      const expired = now >= end

      return {
        ...sess,
        ended: sess.ended || expired
      }
    })

    setSessions(normalized)
  }

  useEffect(() => {
    const init = async () => {
      await loadRouters()
      await loadSessions()
      setLoading(false)
    }

    init()

    const t = setInterval(loadSessions, 8000) // auto refresh
    return () => clearInterval(t)
  }, [])

  const extend = async (id) => {
    await api.extendSession({ sessionId: id, hours: 1, token: localStorage.getItem('gh_token') })
    loadSessions()
  }

  const terminate = async (id) => {
    await api.terminateSession({ sessionId: id, token: localStorage.getItem('gh_token') })
    loadSessions()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
    </div>
  )

  // 🔹 Recherche globale multi-champs + Active/Expired
  // Sessions visibles et filtrées par recherche
    const filteredSessions = sessions.filter(s => {
      const q = search.toLowerCase()
      const status = s.ended ? "expired" : "active"
      return (
        s.phone?.toLowerCase().includes(q) ||
        s.mac?.toLowerCase().includes(q) ||
        s.router?.name?.toLowerCase().includes(q) ||
        s.commune?.toLowerCase().includes(q) ||
        status.includes(q)
      )
    })

    // 🔹 Badge = nombre de sessions actives dans le filtre courant
    const activeFilteredCount = filteredSessions.filter(s => !s.ended).length
    // 3️⃣ Nombre de sessions expirées dans le filtre
    const expiredFilteredCount = filteredSessions.filter(s => s.ended).length


  return (
    <div>

      {/* 🔔 Notifications expiration */}
      {expiredNotifs.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {expiredNotifs.map((msg, i) => (
            <div
              key={i}
              className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg shadow-lg animate-pulse"
            >
              {msg}
            </div>
          ))}
        </div>
      )}

      {/* Titre avec badge total */}
      <div className="flex items-center gap-2">
        <h2 className="text-2xl">Sessions</h2>
        <div className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
          {activeFilteredCount }
        </div>
        {/* 🔹 Badge expiré */}
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-sm font-semibold">
          {expiredFilteredCount}
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mt-2 mb-4">
        <input
          type="text"
          placeholder="Search by phone, MAC, router, commune or Active/Expired..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      {routers.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-4 rounded-lg-soft">
          <strong>Aucun router configuré.</strong><br />
          Vous devez ajouter un router pour voir les sessions.
        </div>
      )}

      <div className="mt-4 bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
        <table className="w-full border-collapse">
          <thead className="text-slate-200 text-sm backdrop-blur-sm bg-black/0 border-b border-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Phone</th>
              <th className="px-3 py-2 text-left">MAC</th>
              <th className="px-3 py-2 text-left">Router</th>
              <th className="px-3 py-2 text-left">Commune</th>
              <th className="px-3 py-2 text-left">End Time</th>
              <th className="px-3 py-2 text-left">Remaining</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSessions.map((s) => {
              const end = new Date(s.end_time).getTime()
              const now = Date.now()
              const expired = s.ended || now >= end
              const remainingHours = Math.max(
                0,
                Math.round((end - now) / 3600000)
              )

              return (
                <tr
                  key={s.id}
                  className={`border-t border-slate-800 ${
                    expired ? "opacity-50 grayscale" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
                      <PhoneIcon className="w-4 h-4" />
                      {s.phone}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-white text-xs font-medium">
                      <CpuChipIcon className="w-4 h-4 text-green-400" />
                      {s.mac}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-white text-xs font-medium">
                      <WifiIcon className="w-4 h-4 text-primary" />
                      {s.router?.name || "—"}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-white text-xs font-medium">
                      <MapPinIcon className="w-4 h-4 text-yellow-400" />
                      {s.commune}
                    </span>
                  </td>

                  {/* End Time */}
                  <td className="px-3 py-2">
                    {expired ? (
                      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
                        <XCircleIcon className="w-4 h-4" />
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-white text-xs font-medium">
                        <CalendarDaysIcon className="w-4 h-4 text-purple-400" />
                        {new Date(s.end_time).toLocaleString()}
                      </span>
                    )}
                  </td>

                  {/* Remaining */}
                  <td className="px-3 py-2">
                    {expired ? (
                      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
                        <XCircleIcon className="w-4 h-4" />
                        X
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-400 text-xs font-semibold">
                        <ClockIcon className="w-4 h-4" />
                        {remainingHours}h
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {!expired && (
                      <>
                        <button
                          onClick={() => extend(s.id)}
                          className="mr-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold hover:bg-green-500/20 transition"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          Extend
                        </button>

                        <button
                          onClick={() => terminate(s.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition"
                        >
                          <StopCircleIcon className="w-4 h-4" />
                          Terminate
                        </button>
                      </>
                    )}

                    {expired && (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-semibold">
                        <XCircleIcon className="w-4 h-4" />
                        No actions
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}

            {filteredSessions.length === 0 && (
              <tr>
                <td colSpan="7" className="px-3 py-6 text-slate-400 text-center">
                  No sessions
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
