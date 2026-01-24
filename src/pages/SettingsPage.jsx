import React, { useState, useEffect } from 'react'
import axios from 'axios'

// 🔹 Définir la base URL de ton API
axios.defaults.baseURL = 'http://192.168.87.41:8000' // <-- adapte selon ton backend

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessProfile: '',
    apiKeys: '',
    wavePaymentLink: '',
    mikrotikBaseUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // 🔹 Charger les settings depuis l'API
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token manquant, veuillez vous reconnecter')

        const res = await axios.get('/settings/', {
          headers: { Authorization: `Bearer ${token}` },
        })

        setSettings({
          businessProfile: res.data.businessProfile || '',
          apiKeys: res.data.apiKeys || '',
          wavePaymentLink: res.data.wavePaymentLink || '',
          mikrotikBaseUrl: res.data.mikrotikBaseUrl || '',
        })
      } catch (err) {
        console.error(err.response || err.message)
        setError(
          err.response?.data?.detail ||
          err.message ||
          'Erreur lors du chargement des paramètres'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // 🔹 Handler pour changer les inputs
  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // 🔹 Handler pour sauvegarder les settings
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token manquant, veuillez vous reconnecter')

      const res = await axios.put('/settings/', settings, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSuccess('Paramètres sauvegardés avec succès ✅')
      setSettings(res.data)
    } catch (err) {
      if (err.response?.data) {
        // backend renvoie des erreurs de validation
        setError(JSON.stringify(err.response.data))
      } else {
        setError(err.message || 'Erreur inconnue lors de la sauvegarde')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Chargement des paramètres...</p>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Paramètres</h2>

      {error && <div className="mb-4 p-2 bg-red-700 text-white rounded">{error}</div>}
      {success && <div className="mb-4 p-2 bg-green-700 text-white rounded">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400">Business Profile</label>
          <textarea
            name="businessProfile"
            value={settings.businessProfile}
            onChange={handleChange}
            className="mt-1 p-2 bg-slate-800 rounded-md w-full"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400">API Keys</label>
          <textarea
            name="apiKeys"
            value={settings.apiKeys}
            onChange={handleChange}
            className="mt-1 p-2 bg-slate-800 rounded-md w-full"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400">Wave Payment Link</label>
          <input
            type="text"
            name="wavePaymentLink"
            value={settings.wavePaymentLink}
            onChange={handleChange}
            className="mt-1 p-2 bg-slate-800 rounded-md w-full"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400">MikroTik API Base URL</label>
          <input
            type="text"
            name="mikrotikBaseUrl"
            value={settings.mikrotikBaseUrl}
            onChange={handleChange}
            className="mt-1 p-2 bg-slate-800 rounded-md w-full"
            placeholder="http://router.api/"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  )
}
