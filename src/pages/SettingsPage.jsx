import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function UserProfileSettings() {
  const { token, user } = useAuth()

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [step, setStep] = useState('edit') // edit | verify | newpass

  const [form, setForm] = useState({
    username: '',
    email: '',
    current_password: '',
    new_password: ''
  })

  const [settings, setSettings] = useState({
    routersApi: '',
    waveLink: ''
  })

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        username: user.username || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
    setSuccess(null)
  }

  const handleSettingsChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFirstSave = () => {
    if (!form.username || !form.email) {
      setError("Username et email requis")
      return
    }
    setStep('verify')
  }

  const handleVerifyPassword = () => {
    if (!form.current_password) {
      setError("Entrez votre mot de passe actuel")
      return
    }
    setStep('newpass')
  }

  const handleFinalSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!token) throw new Error('Session expirée')

      await api.updateProfile({
        username: form.username,
        email: form.email,
        current_password: form.current_password,
        new_password: form.new_password || undefined,
        token
      })

      setSuccess('Profil mis à jour avec succès ✅')
      setModalOpen(false)
      setStep('edit')

      const updated = await api.getProfile(token)
      localStorage.setItem('gh_user', JSON.stringify(updated))
      window.location.reload()

    } catch (err) {
      setError(err.data?.detail || err.message || 'Erreur lors de la mise à jour')
      setStep('verify')
    } finally {
      setSaving(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setStep('edit')
    setError(null)
    setSuccess(null)
    setForm(f => ({ ...f, current_password: '', new_password: '' }))
  }

  return (
    <div className="space-y-6">

      {/* 🧱 BOX SETTINGS */}
      <div className="bg-[rgba(6,10,14,0.6)] p-5 rounded-lg-soft neon">
        <h3 className="text-lg font-semibold mb-4">Speed settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* API Routers */}
          <div>
            <label className="text-sm text-slate-400">API Router(s)</label>
            <input
              name="routersApi"
              value={settings.routersApi}
              onChange={handleSettingsChange}
              placeholder="http://router.api/"
              className="mt-1 w-full p-2 rounded-md bg-slate-800"
            />
          </div>

          {/* Wave */}
          <div>
            <label className="text-sm text-slate-400">Wave Link</label>
            <input
              name="waveLink"
              value={settings.waveLink}
              onChange={handleSettingsChange}
              placeholder="https://pay.wave.com/..."
              className="mt-1 w-full p-2 rounded-md bg-slate-800"
            />
          </div>
        </div>

        {/* 💾 Bouton save settings */}
        <div className="mt-4 flex justify-end">
          <button className="px-5 py-2 rounded-md bg-cyan-800 text-white hover:bg-slate-600">
            Save your settings
          </button>
        </div>
      </div>

      {/* 🧱 BOX PROFIL */}
      <div className="bg-[rgba(6,10,14,0.6)] p-5 rounded-lg-soft neon flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Profil</h3>
          <p className="text-sm text-slate-400">
            Edit your email, username and password !
          </p>
        </div>

        {/* 🔘 Bouton moderne */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-cyan text-black hover:opacity-70 neon"
          title="Modifier le profil"
        >
          <span className="text-lg">⚙️</span>
          <span className="font-medium text-green-400">Edit</span>
        </button>
      </div>

      {/* 🪟 MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[rgba(6,10,14,0.95)] p-6 rounded-lg-soft w-full max-w-md neon">
            <h2 className="text-xl font-semibold mb-4">Edit your profil</h2>

            {error && (
              <div className="mb-3 p-2 bg-red-700 text-white rounded text-sm">
                {error}
              </div>
            )}

            {step === 'edit' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400">Username</label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 rounded-md bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 rounded-md bg-slate-800"
                  />
                </div>
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-3">
                <label className="text-sm text-slate-400">
                  Enter your password now !
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={form.current_password}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 rounded-md bg-slate-800"
                />
              </div>
            )}

            {step === 'newpass' && (
              <div className="space-y-3">
                <label className="text-sm text-slate-400">
                  Enter your new password
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={form.new_password}
                  onChange={handleChange}
                  placeholder="Laisser vide pour ne pas changer"
                  className="mt-1 w-full p-2 rounded-md bg-slate-800"
                />
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-md bg-slate-700 text-white hover:bg-slate-600"
              >
                Cancel
              </button>

              {step === 'edit' && (
                <button
                  onClick={handleFirstSave}
                  className="px-4 py-2 rounded-md text-black bg-primary"
                >
                  Save
                </button>
              )}

              {step === 'verify' && (
                <button
                  onClick={handleVerifyPassword}
                  className="px-4 py-2 rounded-md text-black bg-primary"
                >
                  Continuous
                </button>
              )}

              {step === 'newpass' && (
                <button
                  onClick={handleFinalSave}
                  disabled={saving}
                  className={`px-4 py-2 rounded-md text-black ${
                    saving ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary'
                  }`}
                >
                  {saving ? 'Sauvegarde...' : 'Terminer'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
