import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(email, password)
      if (res.user.role === 'SUPER_ADMIN') navigate('/super')
      if (res.user.role === 'BUSINESS_OWNER') navigate('/owner')
      if (res.user.role === 'STAFF') navigate('/staff')
    } catch (e) {
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-[rgba(6,10,14,0.6)] p-6 rounded-lg-soft neon">
        <h2 className="text-2xl font-semibold mb-2">Login</h2>
        <label className="block text-sm">Username</label>
        <input className="w-full mt-1 p-2 rounded-md bg-slate-800 border border-slate-700" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-sm mt-3">Password</label>
        <input type="password" className="w-full mt-1 p-2 rounded-md bg-slate-800 border border-slate-700" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex items-center justify-between mt-4">
          <button type="submit" disabled={loading} className="bg-primary text-black px-4 py-2 rounded-md font-semibold">Login</button>
          <Link to="/register" className="text-sm text-slate-400">Sign up?</Link>
          <Link to="/forgot-password" className="text-sm text-slate-400">Forgot password?</Link>
        </div>
      </form>
    </div>
  )
}
