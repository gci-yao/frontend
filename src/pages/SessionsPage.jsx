import React, { useEffect, useState } from 'react'
import api from '../services/api'
import {
  ArrowPathIcon,
  StopCircleIcon,
  PhoneIcon ,
  CpuChipIcon,
  WifiIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";



export default function SessionsPage() {
  const [sessions, setSessions] = useState([])
  const [routers, setRouters] = useState([])
  const [loading, setLoading] = useState(true)

  const loadRouters = async () => {
    const r = await api.getRouters({ token: localStorage.getItem('gh_token') })
    setRouters(r || [])
  }

  const loadSessions = async () => {
    const s = await api.getSessions({ token: localStorage.getItem('gh_token') })
    setSessions(s)
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

  if (loading) return <div className="text-slate-400">Chargement…</div>

  return (
    <div>
      <h2 className="text-2xl">Sessions</h2>

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
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-slate-800">
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

                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1 text-white text-xs font-medium">
                    <CalendarDaysIcon className="w-4 h-4 text-purple-400" />
                    {new Date(s.end_time).toLocaleString()}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      s.ended ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    <ClockIcon className="w-4 h-4" />
                    {s.ended
                      ? "Ended"
                      : `${Math.max(
                          0,
                          Math.round((new Date(s.end_time) - Date.now()) / 3600000)
                        )}h`}
                  </span>
                </td>

                <td className="px-3 py-2 whitespace-nowrap">
                  {!s.ended && (
                    <button
                      onClick={() => extend(s.id)}
                      className="mr-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold hover:bg-green-500/20 transition"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Extend
                    </button>
                  )}

                  {!s.ended && (
                    <button
                      onClick={() => terminate(s.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition"
                    >
                      <StopCircleIcon className="w-4 h-4" />
                      Terminate
                    </button>
                  )}
                </td>

              </tr>
            ))}

            {sessions.length === 0 && (
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
