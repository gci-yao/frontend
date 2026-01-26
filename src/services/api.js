const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

function authHeaders(token) {
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

async function request(path, { method = 'GET', token, body, params } = {}) {
  const url = new URL(API_BASE + path)
  if (params) {
    Object.keys(params).forEach(k => url.searchParams.append(k, params[k]))
  }
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders(token)
  }
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error(data?.detail || 'API error')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export default {
  async login({ email, password }) {
    const data = await request('/auth/login/', { method: 'POST', body: { username: email, password } })
    return { token: data.access, refresh: data.refresh, user: null }
  },

  async register(payload) {
    const data = await request('/auth/register/', { method: 'POST', body: payload })
    return { token: data.token || data.access, refresh: data.refresh, user: data.user || null }
  },

  async getProfile(token) {
    return request('/auth/profile/', { token })
  },

  async getSuperStats(token) {
    return request('/super/stats/', { token })
  },
  async getBusinesses(token) {
    return request('/super/businesses/', { token })
  },
  async approveBusiness({ businessId, token }) {
    return request('/super/business/approve/', { method: 'POST', token, body: { businessId } })
  },
  async suspendBusiness({ businessId, token }) {
    return request('/super/business/suspend/', { method: 'POST', token, body: { businessId } })
  },

  async getOwnerStats({ token }) {
    return request('/owner/stats/', { token })
  },

  async getPayments({ token, filters } = {}) {
    return request('/payments/', { token, params: filters })
  },
  async confirmPayment({ paymentId, token }) {
    return request('/payment/confirm/', { method: 'POST', token, body: { paymentId } })
  },
  async rejectPayment({ paymentId, token }) {
    return request('/payment/reject/', { method: 'POST', token, body: { paymentId } })
  },

  async getSessions({ token, businessId } = {}) {
    return request('/sessions/', { token, params: businessId ? { businessId } : undefined })
  },
  async extendSession({ sessionId, hours = 1, token }) {
    return request('/sessions/extend/', { method: 'POST', token, body: { sessionId, hours } })
  },
  async terminateSession({ sessionId, token }) {
    return request('/sessions/terminate/', { method: 'POST', token, body: { sessionId } })
  },

  async getRouters({ token } = {}) {
    return request('/routers/', { token })
  },
  async getMyRouters({ token } = {}) {
  // Retourne les routers de l'utilisateur connecté
  return request('/routers/', { token })
},


  // ✅ Correction : envoyer les champs à plat, pas sous { router }
  async createRouter({ name, ip, location, api_user, api_pass, token }) {
    return request('/routers/create/', {
      method: 'POST',
      token,
      body: { name, ip, location, api_user, api_pass }
    })
  },

  async updateRouter({ routerId, name, ip, location, api_user, api_pass, token }) {
    return request('/routers/update/', {
      method: 'PUT',
      token,
      body: { routerId, name, ip, location, api_user, api_pass }
    })
  },

  async deleteRouter({ routerId, token }) {
    return request('/routers/delete/', { method: 'DELETE', token, body: { routerId } })
  },

// ------------------mis a jour profile ----------------------
    async updateProfile({ username, email, current_password, new_password, token }) {
    return request('/auth/profile/', {
      method: 'POST',
      token,
      body: { username, email, current_password, new_password }
    })
  },

}

