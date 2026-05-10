import api from './api'

export async function loginRequest(payload) {
  const res = await api.post('/auth/login', payload)
  return res.data
}

export async function registerRequest(payload) {
  const res = await api.post('/auth/register', payload)
  return res.data
}

export async function logoutRequest() {
  const res = await api.post('/auth/logout')
  return res.data
}
