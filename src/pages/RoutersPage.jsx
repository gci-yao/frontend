import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CheckIcon, 
  DevicePhoneMobileIcon
} from '@heroicons/react/24/solid';
import { WifiIcon, XMarkIcon } from '@heroicons/react/24/outline'; // WifiIcon pour badge



export default function RoutersPage() {
  const [routers, setRouters] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', ip: '', location: '', apiUser: '', apiPass: '' })
  const [nameError, setNameError] = useState('')
  const [ipError, setIpError] = useState('')
  const [Errors, setErrors] = useState({})


  const load = async () => {
    setRouters(await api.getRouters({ token: localStorage.getItem('gh_token') }))
  }

  useEffect(() => {
    load()
  }, [])

  // Validation temps réel
  useEffect(() => {
    const name = form.name.trim()
    if (!name) {
      setNameError('')
    } else if (!name.startsWith("Router")) {
      setNameError('The name must start "Router"')
    } else if (routers.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      setNameError('This name of Router already, choose another !')
    } else {
      setNameError('')
    }

    // Validation IP
    const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
    if (form.ip && !ipRegex.test(form.ip)) {
      setIpError('IP address invalidate !')
    } else {
      setIpError('')
    }
    
  }, [form, routers])
  
  
  
  const create = async () => {

    if (!form.location) {
      setErrors(e => ({ ...e, errLocation: "Please, Choose the commune of your Router !" }));
      return;
    } else {
      // Clear l'erreur si c'est bon
      setErrors({});
    }
    if (!form.apiUser) {
      setErrors(e => ({ ...e, errApiUser: "Please, Enter your API path !" }));
      return;
    } else {
      // Clear l'erreur si c'est bon
      setErrors({});
    }
    if (!form.apiPass) {
      setErrors(e => ({ ...e, errApiPass: "Please, Enter your API password !" }));
      return;
    } else {
      // Clear l'erreur si c'est bon
      setErrors({});
    }
      
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
      {/* Titre avec badge total routers */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl">Routers</h2>
          <div className="ml-2 w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold gap-1">
            {routers.length}
          </div>
        </div>
        <button onClick={() => setShowForm(s => !s)} className=" flex bg-primary text-black px-3 py-1 rounded-md">
          <WifiIcon className="w-4 h-4"/> New Router
        </button>
      </div>

      {showForm && (
        <div className="mt-4 bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
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

          <div className="grid grid-cols-3 gap-3">

            <div>
              <select
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="p-2 bg-slate-800 rounded-md w-full"
              >
                <option value="">Select a Location of your Router</option>

                {/* Abidjan */}
                <option value="Abobo">Abobo</option>
                <option value="Adjamé">Adjamé</option>
                <option value="Attécoubé">Attécoubé</option>
                <option value="Bingerville">Bingerville</option>
                <option value="Cocody">Cocody</option>
                <option value="Koumassi">Koumassi</option>
                <option value="Marcory">Marcory</option>
                <option value="Plateau">Plateau</option>
                <option value="Port-Bouët">Port-Bouët</option>
                <option value="Treichville">Treichville</option>
                <option value="Yopougon">Yopougon</option>
                <option value="Anyama">Anyama</option>
                <option value="Songon">Songon</option>

                {/* Grandes villes */}
                <option value="Bouaké">Bouaké</option>
                <option value="Yamoussoukro">Yamoussoukro</option>
                <option value="Daloa">Daloa</option>
                <option value="San-Pédro">San-Pédro</option>
                <option value="Korhogo">Korhogo</option>
                <option value="Man">Man</option>
                <option value="Gagnoa">Gagnoa</option>
                <option value="Abengourou">Abengourou</option>
                <option value="Bondoukou">Bondoukou</option>
                <option value="Séguéla">Séguéla</option>
                <option value="Odienné">Odienné</option>
                <option value="Divo">Divo</option>
                <option value="Sassandra">Sassandra</option>
                <option value="Grand-Bassam">Grand-Bassam</option>
                <option value="Aboisso">Aboisso</option>
                <option value="Agboville">Agboville</option>
                <option value="Dabou">Dabou</option>
                <option value="Toumodi">Toumodi</option>
                <option value="Ferkessédougou">Ferkessédougou</option>
                <option value="Boundiali">Boundiali</option>
                <option value="Bouna">Bouna</option>
                <option value="Tingréla">Tingréla</option>
                <option value="Issia">Issia</option>
                <option value="Bangolo">Bangolo</option>
                <option value="Guiglo">Guiglo</option>
                <option value="Vavoua">Vavoua</option>
                <option value="Soubré">Soubré</option>
                <option value="Lakota">Lakota</option>
                <option value="Zuénoula">Zuénoula</option>
              </select>
              {Errors.errLocation && <p className='text-red-500'>{Errors.errLocation}</p>}
            </div>

            <input
              placeholder="For Example : http://API/path"
              value={form.apiUser}
              onChange={e => setForm({ ...form, apiUser: e.target.value })}
              className="p-2 bg-slate-800 rounded-md"
            />
            {Errors.errApiUser && <p className='text-red-500'>{Errors.errApiUser}</p>}
            <input
              placeholder="API Password"
              value={form.apiPass}
              onChange={e => setForm({ ...form, apiPass: e.target.value })}
              className="p-2 bg-slate-800 rounded-md"
            />
            {Errors.errApiPass && <p className='text-red-500'>{Errors.errApiPass}</p>}
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
                <td className="px-3 py-2 flex items-center gap-2">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-blue-400"/>
                  {r.name}
                </td>
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
                  <button onClick={() => del(r.id)} className="inline-flex px-2 py-0 gap-1 bg-red-500/10 text-red-500 font-medium rounded-full ">
                    <XCircleIcon className="w-5 h-5 -py-2 my-1"/> Delete 
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
