import React, { useEffect, useState } from 'react'
import api from '../services/api'

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
          <thead className="text-slate-400 text-sm">
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
                <td className="px-3 py-2">{s.phone}</td>
                <td className="px-3 py-2">{s.mac}</td>
                <td className="px-3 py-2">{s.router?.name}</td>
                <td className="px-3 py-2">{s.commune}</td>
                <td className="px-3 py-2">
                  {new Date(s.end_time).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  {s.ended
                    ? 'Ended'
                    : `${Math.max(
                        0,
                        Math.round(
                          (new Date(s.end_time) - Date.now()) / 3600000
                        )
                      )}h`}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {!s.ended && (
                    <button
                      onClick={() => extend(s.id)}
                      className="mr-2 px-3 py-1 bg-primary text-black rounded-sm"
                    >
                      Extend
                    </button>
                  )}
                  {!s.ended && (
                    <button
                      onClick={() => terminate(s.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-sm"
                    >
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
