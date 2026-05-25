import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from '../constants/systems'
import { getUiLanguage } from '../i18n/translations'
import { apiUrl, parseJsonResponse } from '../api/config'
import { collectDeviceProfile } from '../utils/deviceProfile'
import { AuthContext } from './authContext'

const TOKEN_KEY = 'jyotish_token'

function readRegisterLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  return getUiLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE)
}

function applySession(setToken, setUser, data) {
  localStorage.setItem(TOKEN_KEY, data.token)
  setToken(data.token)
  setUser(data.user)
}

async function withDeviceProfile(payload) {
  const profile = await collectDeviceProfile()
  return { ...payload, ...profile }
}

async function syncDeviceProfile(token) {
  if (!token) return

  try {
    const profile = await collectDeviceProfile()
    await fetch(apiUrl('/auth/device-profile'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    })
  } catch {
    // Non-blocking background sync
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  const patchUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  useEffect(() => {
    if (!token) return

    fetch(apiUrl('/auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => (r.ok ? parseJsonResponse(r) : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
          syncDeviceProfile(token)
        } else {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const res = await fetch(apiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await withDeviceProfile({ email, password })),
    })
    const data = await parseJsonResponse(res)
    if (!res.ok) throw new Error(data.message || 'Login failed')
    applySession(setToken, setUser, data)
    return data.user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await fetch(apiUrl('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await withDeviceProfile({
        name,
        email,
        password,
        language: readRegisterLanguage(),
      })),
    })
    const data = await parseJsonResponse(res)
    if (!res.ok) throw new Error(data.message || 'Registration failed')
    applySession(setToken, setUser, data)
    return data.user
  }, [])

  const loginWithGoogle = useCallback(async (credential) => {
    const res = await fetch(apiUrl('/auth/google'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await withDeviceProfile({
        credential,
        language: readRegisterLanguage(),
      })),
    })
    const data = await parseJsonResponse(res)
    if (!res.ok) throw new Error(data.message || 'Google sign-in failed')
    applySession(setToken, setUser, data)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, patchUser }}>
      {children}
    </AuthContext.Provider>
  )
}
