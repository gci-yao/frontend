import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function RoutersPage() {
  const [routers, setRouters] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', ip: '', location: '', apiUser: '', apiPass: '' })

  const load = async () => {
    setRouters(await api.getRouters({ token: localStorage.getItem('gh_token') }))
    
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    try {
      await api.createRouter({
        name: form.name,
        ip: form.ip,
        location: form.location,
        api_user: form.apiUser,
        api_pass: form.apiPass,
        token: localStorage.getItem('gh_token')
      })

      setShowForm(false)
      setForm({ name: '', ip: '', location: '', apiUser: '', apiPass: '' })
      load()
    } catch (e) {
      console.error("CREATE ROUTER ERROR:", e?.data || e)
      alert("Erreur lors de la création du router")
    }
  }

  const del = async (id) => {
    const proceed = window.confirm("Do you really want to delete this Router?")
    if (!proceed) return

    await api.deleteRouter({ routerId: id, token: localStorage.getItem('gh_token') })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Routers</h2>
        <button onClick={() => setShowForm(s => !s)} className="bg-primary text-black px-3 py-1 rounded-md">New Router</button>
      </div>

      {showForm && (
        <div className="mt-4 bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="p-2 bg-slate-800 rounded-md" />
            <input placeholder="IP" value={form.ip} onChange={e => setForm({ ...form, ip: e.target.value })} className="p-2 bg-slate-800 rounded-md" />
            <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="p-2 bg-slate-800 rounded-md" />
            <input placeholder="API Username" value={form.apiUser} onChange={e => setForm({ ...form, apiUser: e.target.value })} className="p-2 bg-slate-800 rounded-md" />
            <input placeholder="API Password" value={form.apiPass} onChange={e => setForm({ ...form, apiPass: e.target.value })} className="p-2 bg-slate-800 rounded-md" />
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={create} className="bg-primary text-black px-3 py-1 rounded-md">Create</button>
          </div>
        </div>
      )}

      <div className="mt-4 bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
        <table className="w-full border-collapse">
          <thead className="text-slate-400 text-sm">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">IP</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Health</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {routers.map((r) => (
              <tr key={r.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.ip}</td>
                <td className="px-3 py-2">{r.location}</td>
                <td
                  className={`px-3 py-2 ${
                    r.health === 'ok' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {r.health}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    onClick={() => del(r.id)}
                    className="px-3 py-1 bg-red-600 rounded-sm text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {routers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-3 py-6 text-slate-400 text-center">
                  No routers
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  )
}
