import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function RoleGuard({ allowedRoles = [], children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super" replace />
    if (user.role === 'BUSINESS_OWNER') return <Navigate to="/owner" replace />
    if (user.role === 'STAFF') return <Navigate to="/staff" replace />
    return <Navigate to="/" replace />
  }
  return children
}
