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
        <table className="w-full">
          <thead className="text-slate-400 text-sm">
            <tr>
              <th>Phone</th>
              <th>MAC</th>
              <th>Router</th>
              <th>End Time</th>
              <th>Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-slate-800">
                <td>{s.phone}</td>
                <td>{s.mac}</td>
                <td>{s.router?.name}</td>
                <td>{new Date(s.end_time).toLocaleString()}</td>
                <td>
                  {s.ended
                    ? 'Ended'
                    : `${Math.max(0, Math.round((new Date(s.end_time) - Date.now()) / 3600000))}h`}
                </td>
                <td>
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
                <td colSpan="6" className="py-6 text-slate-400">
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
