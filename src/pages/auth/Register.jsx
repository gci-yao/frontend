import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    city: '',
    country: '',
    commissionRate: 10
  })
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      navigate('/owner')
    } catch (err) {
      alert('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-lg bg-[rgba(6,10,14,0.6)] p-6 rounded-lg-soft neon">
        <h2 className="text-2xl font-semibold mb-2">Register Business</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Business name</label>
            <input value={form.businessName} onChange={handle('businessName')} className="mt-1 w-full p-2 rounded-md bg-slate-800" />
          </div>
          <div>
            <label className="text-sm">Owner name</label>
            <input value={form.ownerName} onChange={handle('ownerName')} className="mt-1 w-full p-2 rounded-md bg-slate-800" />
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <input value={form.phone} onChange={handle('phone')} className="mt-1 w-full p-2 rounded-md bg-slate-800" />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input value={form.email} onChange={handle('email')} className="mt-1 w-full p-2 rounded-md bg-slate-800" />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input value={form.password} onChange={handle('password')} type="password" className="mt-1 w-full p-2 rounded-md bg-slate-800" />
          </div>
          <div>
            <label className="text-sm">Commission rate %</label>
            <input value={form.commissionRate} onChange={handle('commissionRate')} type="number" className="mt-1 w-full p-2 rounded-md bg-slate-800" />
          </div>
          <div>
            <label className="text-sm">City</label>
            <input value={form.city} onChange={handle('city')} className="mt-1 w-full p-2 rounded-md bg-slate-800" />
          </div>
          <div>
            <label className="text-sm">Country</label>
            <input value={form.country} onChange={handle('country')} className="mt-1 w-full p-2 rounded-md bg-slate-800" />
          </div>
        </div>
        <div className="mt-4 flex justify-around">
          <button type="submit" disabled={loading} className="bg-primary text-black px-4 py-2 rounded-md">Register</button>
          <Link to="/login" className="text-sm text-slate-400">Login ?</Link>
        </div>
      </form>
    </div>
  )
}
