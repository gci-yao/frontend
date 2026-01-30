import React, { useState } from 'react'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError("Please enter your email")
      return
    }

    setLoading(true)
    try {
      await api.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(err.data?.detail || "Error sending reset link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-[rgba(6,10,14,0.6)] p-6 rounded-lg-soft neon"
      >
        <h2 className="text-2xl font-semibold mb-2">Forgot Password</h2>

        {!sent ? (
          <>
            <label className="text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-slate-800"
            />

            {error && <p className="text-red-500 mt-1">{error}</p>}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-black px-4 py-2 rounded-md"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-slate-300">
            If this email exists, a reset link was sent.
          </div>
        )}
      </form>
    </div>
  )
}
