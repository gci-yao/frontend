import React, { useState } from 'react'
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-[rgba(6,10,14,0.6)] p-6 rounded-lg-soft neon">
        <h2 className="text-2xl font-semibold mb-2">Forgot Password</h2>
        {!sent ? (
          <>
            <label className="text-sm">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full p-2 rounded-md bg-slate-800" />
            <div className="mt-4 flex justify-end">
              <button type="submit" className="bg-primary text-black px-4 py-2 rounded-md">Send reset link</button>
            </div>
          </>
        ) : (
          <div className="text-slate-300">If this email exists, a reset link was sent.</div>
        )}
      </form>
    </div>
  )
}
