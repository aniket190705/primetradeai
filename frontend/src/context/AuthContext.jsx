import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { AUTH_USER_KEY } from '../utils/constants'
import { decodeJwtPayload } from '../utils/jwt'
import { setSessionInvalidHandler } from '../utils/authEvents'
import { setAccessToken } from '../utils/tokenMemory'
import { bootstrapRefresh } from '../services/api'
import { loginRequest, logoutRequest, registerRequest } from '../services/authService'

const AuthContext = createContext(null)

function loadStoredUser() {
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function minimalUserFromAccessToken(token) {
  const payload = decodeJwtPayload(token)
  if (!payload?.userId) return null
  return {
    id: payload.userId,
    name: 'User',
    email: '',
    role: payload.role || 'user',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  const clearLocalAuth = useCallback(() => {
    setAccessToken(null)
    sessionStorage.removeItem(AUTH_USER_KEY)
    setUser(null)
  }, [])

  useEffect(() => {
    setSessionInvalidHandler(() => {
      clearLocalAuth()
    })
  }, [clearLocalAuth])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const token = await bootstrapRefresh()
        if (cancelled || !token) {
          if (!cancelled) clearLocalAuth()
          return
        }
        let nextUser = loadStoredUser()
        if (!nextUser) {
          nextUser = minimalUserFromAccessToken(token)
        }
        if (!cancelled) setUser(nextUser)
      } catch {
        if (!cancelled) clearLocalAuth()
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [clearLocalAuth])

  const login = useCallback(async ({ email, password }) => {
    const data = await loginRequest({ email, password })
    const { accessToken, user: u } = data.data
    setAccessToken(accessToken)
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const data = await registerRequest({ name, email, password, role: 'user' })
    const { accessToken, user: u } = data.data
    setAccessToken(accessToken)
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Still clear local session if cookie expired
    } finally {
      clearLocalAuth()
    }
  }, [clearLocalAuth])

  const value = useMemo(
    () => ({
      user,
      initializing,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, initializing, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
