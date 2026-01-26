import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CheckIcon, 

} from '@heroicons/react/24/solid';

export default function RoutersPage() {
  const [routers, setRouters] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', ip: '', location: '', apiUser: '', apiPass: '' })
  const [nameError, setNameError] = useState('')
  const [ipError, setIpError] = useState('')
  

  const load = async () => {
    setRouters(await api.getRouters({ token: localStorage.getItem('gh_token') }))
  }

  useEffect(() => {
    load()
  }, [])

  // ---------- Validation temps réel ----------
  useEffect(() => {
    const name = form.name.trim()
    if (!name) {
      setNameError('')
    } else if (!name.startsWith("Router")) {
      setNameError('Le nom doit commencer par "Router"')
    } else if (routers.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      setNameError('Ce nom de router existe déjà, choisissez un autre')
    } else {
      setNameError('')
    }

    // Validation IP
    const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
    if (form.ip && !ipRegex.test(form.ip)) {
      setIpError('Adresse IP invalide')
    } else {
      setIpError('')
    }
  }, [form, routers])

  const create = async () => {
    try {
      await api.createRouter({
        name: form.name,
        ip: form.ip,
        location: form.location.toLowerCase(),
        api_user: form.apiUser,
        api_pass: form.apiPass,
        token: localStorage.getItem('gh_token')
      })
      setShowForm(false)
      setForm({ name: '', ip: '', location: '', apiUser: '', apiPass: '' })
      load()
    } catch (e) {
      const err = e?.data || e
      if (err?.name) setNameError(err.name)
      else alert("Erreur lors de la création du router")
    }
  }

  const del = async (id) => {
    if (!window.confirm("Do you really want to delete this Router?")) return
    await api.deleteRouter({ routerId: id, token: localStorage.getItem('gh_token') })
    load()
  }

  const isFormInvalid = !!nameError || !!ipError || !form.name || !form.ip

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Routers</h2>
        <button onClick={() => setShowForm(s => !s)} className="bg-primary text-black px-3 py-1 rounded-md">
          New Router
        </button>
      </div>

      {showForm && (
        <div className="mt-4 bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
          {/* Ligne 1 : Name + IP */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="p-2 bg-slate-800 rounded-md w-full"
              />
              {nameError && <p className="text-red-500 mt-1 text-sm">{nameError}</p>}
            </div>
            <div>
              <input
                placeholder="IP"
                value={form.ip}
                onChange={e => setForm({ ...form, ip: e.target.value })}
                className="p-2 bg-slate-800 rounded-md w-full"
              />
              {ipError && <p className="text-red-500 mt-1 text-sm">{ipError}</p>}
            </div>
          </div>

          {/* Ligne 2 : Location + API Username + API Password */}
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Location"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className="p-2 bg-slate-800 rounded-md"
            />
            <input
              placeholder="API Username"
              value={form.apiUser}
              onChange={e => setForm({ ...form, apiUser: e.target.value })}
              className="p-2 bg-slate-800 rounded-md"
            />
            <input
              placeholder="API Password"
              value={form.apiPass}
              onChange={e => setForm({ ...form, apiPass: e.target.value })}
              className="p-2 bg-slate-800 rounded-md"
            />
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={create}
              disabled={isFormInvalid}
              className={`px-3 py-1 rounded-md text-black ${isFormInvalid ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary'}`}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Tableau des routers */}
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
            {routers.map(r => (
              <tr key={r.id} className="border-t border-slate-800 text-wrap">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.ip}</td>
                <td className="px-3 py-2">{r.location}</td>
                <td className="px-3 py-2">
                                    {r.health === "ok" ? (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        OK
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
                                        <XCircleIcon className="w-4 h-4" />
                                        DOWN
                                        </div>
                                    )}
                  </td>
                <td className="rounded-full whitespace-nowrap flex items-center gap-1 px-3 py-1 ">
                  <button onClick={() => del(r.id)} className="flex px-2 py-0 gap-1 bg-red-500/10 text-red-500 font-medium rounded-full ">
                    <XCircleIcon className="w-5 h-5 -py-2 my-1"/> Delete 
                  </button>
                </td>
              </tr>
            ))}
            {routers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-3 py-6 text-slate-400 text-center">No routers</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
