import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'

const UserContext = createContext(null)

const TOKEN_KEY   = 'biasmap_token'
const REFRESH_KEY = 'biasmap_refresh_token'
const USER_KEY    = 'biasmap_user'
const GUEST_DATA_KEY = 'biasmap_guest_data'

export function UserProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)  // true once we've checked localStorage

  // Restore session on mount
  useEffect(() => {
    const savedToken   = localStorage.getItem(TOKEN_KEY)
    const savedUser    = localStorage.getItem(USER_KEY)
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch { /* corrupt data */ }
    }
    setReady(true)
  }, [])

  const _persist = (accessToken, refreshToken, usr) => {
    setToken(accessToken)
    setUser(usr)
    localStorage.setItem(TOKEN_KEY,   accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
    localStorage.setItem(USER_KEY,    JSON.stringify(usr))
  }

  const register = useCallback(async ({ name, email, password }) => {
    const data = await api.post('/auth/register', { name, email, password })
    _persist(data.accessToken, data.refreshToken, data.user)
    return data.user
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const data = await api.post('/auth/login', { email, password })
    _persist(data.accessToken, data.refreshToken, data.user)
    return data.user
  }, [])

  const continueAsGuest = useCallback(async () => {
    const data = await api.post('/auth/guest', {})
    _persist(data.accessToken, data.refreshToken, data.user)
    return data.user
  }, [])

  const googleLogin = useCallback(async (idToken) => {
    const data = await api.post('/auth/google', { idToken })
    _persist(data.accessToken, data.refreshToken, data.user)
    return data.user
  }, [])

  const facebookLogin = useCallback(async (accessToken) => {
    const data = await api.post('/auth/facebook', { accessToken })
    _persist(data.accessToken, data.refreshToken, data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => {})
    }
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  // Guest local data helpers
  const getGuestData = useCallback(() => {
    try { return JSON.parse(localStorage.getItem(GUEST_DATA_KEY) || '{}') } catch { return {} }
  }, [])

  const saveGuestData = useCallback((key, value) => {
    const data = getGuestData()
    data[key] = value
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data))
  }, [getGuestData])

  const clearGuestData = useCallback(() => {
    localStorage.removeItem(GUEST_DATA_KEY)
  }, [])

  const isGuest = user?.is_guest === true

  return (
    <UserContext.Provider value={{
      user, token, isGuest, ready,
      register, login, continueAsGuest, googleLogin, facebookLogin, logout,
      getGuestData, saveGuestData, clearGuestData,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
