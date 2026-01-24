import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('gh_token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('gh_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && !user) {
      api.getProfile(token).then((u) => {
        setUser(u)
        localStorage.setItem('gh_user', JSON.stringify(u))
      }).catch(() => logout())
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      const access = res.token || res.access
      setToken(access)
      localStorage.setItem('gh_token', access)
      // fetch profile
      const profile = await api.getProfile(access)
      setUser(profile)
      localStorage.setItem('gh_user', JSON.stringify(profile))
      return { token: access, user: profile }
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const res = await api.register(payload)
      const access = res.token || res.access
      setToken(access)
      setUser(res.user)
      localStorage.setItem('gh_token', access)
      localStorage.setItem('gh_user', JSON.stringify(res.user))
      return res
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('gh_token')
    localStorage.removeItem('gh_user')
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
