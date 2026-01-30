import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validToken, setValidToken] = useState(true)

  // 🔐 Vérification token côté frontend
  useEffect(() => {
    if (!token) {
      setValidToken(false)
      return
    }

    api.verifyResetToken(token).catch(() => setValidToken(false))
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!password || password.length < 10) {
      setError("Password must be at least 10 characters")
      return
    }

    setLoading(true)
    try {
      await api.resetPassword({ token, password })
      navigate('/login')
    } catch (err) {
      setError(err.data?.detail || "Invalid or expired token")
    } finally {
      setLoading(false)
    }
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 p-4">
        Invalid or expired reset link
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-[rgba(6,10,14,0.6)] p-6 rounded-lg-soft neon"
      >
        <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>

        <label className="text-sm">New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full p-2 rounded-md bg-slate-800"
        />

        {error && <p className="text-red-500 mt-1">{error}</p>}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-black px-4 py-2 rounded-md"
          >
            {loading ? "Saving..." : "Reset password"}
          </button>
        </div>
      </form>
    </div>
  )
}
