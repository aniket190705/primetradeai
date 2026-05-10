import axios from 'axios'
import { getApiBaseUrl } from '../utils/constants'
import { getAccessToken, setAccessToken } from '../utils/tokenMemory'
import { notifySessionInvalid } from '../utils/authEvents'

const baseURL = getApiBaseUrl()

const plainAxios = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = plainAxios
      .post('/auth/refresh')
      .then((res) => {
        const token = res.data?.data?.accessToken
        if (token) setAccessToken(token)
        return token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function isAuthBypassUrl(config) {
  const full = `${config.baseURL || ''}${config.url || ''}`
  return (
    full.includes('/auth/login') ||
    full.includes('/auth/register') ||
    full.includes('/auth/refresh')
  )
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const status = error.response?.status

    if (status !== 401 || originalRequest._retry || isAuthBypassUrl(originalRequest)) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await refreshAccessToken()
      const token = getAccessToken()
      if (!token) throw new Error('No token after refresh')
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    } catch {
      setAccessToken(null)
      notifySessionInvalid()
      return Promise.reject(error)
    }
  }
)

export default api

let bootstrapRefreshPromise = null

/**
 * Used on app load for silent refresh (HTTP-only cookie).
 *
 * The resolved promise is kept cached and never reset to null.
 * This prevents React Strict Mode from firing a second POST /auth/refresh
 * after the first one has already rotated the token in the DB — which would
 * cause a cookie/DB mismatch and a spurious 401 that logs the user out.
 */
export function bootstrapRefresh() {
  if (!bootstrapRefreshPromise) {
    bootstrapRefreshPromise = plainAxios
      .post('/auth/refresh')
      .then((res) => {
        const token = res.data?.data?.accessToken
        if (token) setAccessToken(token)
        return token
      })
      .catch((err) => {
        // On failure, clear the cache so a future login can retry
        bootstrapRefreshPromise = null
        return Promise.reject(err)
      })
  }
  return bootstrapRefreshPromise
}
