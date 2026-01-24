import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import SuperDashboard from './pages/super/SuperDashboard'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import StaffDashboard from './pages/staff/StaffDashboard'
import PaymentsPage from './pages/PaymentsPage'
import SessionsPage from './pages/SessionsPage'
import RoutersPage from './pages/RoutersPage'
import PricingPage from './pages/PricingPage'
import SettingsPage from './pages/SettingsPage'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/guards/ProtectedRoute'
import RoleGuard from './components/guards/RoleGuard'
import Layout from './components/layout/Layout'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route
            path="/super/*"
            element={
              <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                <SuperDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/owner/*"
            element={
              <RoleGuard allowedRoles={['BUSINESS_OWNER']}>
                <OwnerDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/staff/*"
            element={
              <RoleGuard allowedRoles={['STAFF']}>
                <StaffDashboard />
              </RoleGuard>
            }
          />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/routers" element={<RoutersPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? '/login' : '/'} replace />} />
    </Routes>
  )
}
