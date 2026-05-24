import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { updateUserLanguage } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_STORAGE_KEY } from '../constants/systems'
import { getUiLanguage, translate, translateSign, translations } from './translations'

const LanguageContext = createContext(null)

function readStoredLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  return getUiLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE)
}

function persistLocalLanguage(code) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
}

export function LanguageProvider({ children }) {
  const { user, token, patchUser } = useAuth()
  const [language, setLanguageState] = useState(readStoredLanguage)

  // Apply saved profile language whenever the logged-in user changes
  useEffect(() => {
    if (user?.language) {
      const profileLanguage = getUiLanguage(user.language)
      setLanguageState(profileLanguage)
      persistLocalLanguage(profileLanguage)
    }
  }, [user?._id, user?.language])

  const setLanguage = useCallback(async (code) => {
    const next = getUiLanguage(code)
    setLanguageState(next)
    persistLocalLanguage(next)

    if (token && user) {
      try {
        const data = await updateUserLanguage(next)
        if (data?.user) patchUser(data.user)
      } catch {
        // Keep local choice even if save fails
      }
    }
  }, [token, user, patchUser])

  const value = useMemo(() => {
    const uiLanguage = getUiLanguage(language)
    const copy = translations[uiLanguage]

    return {
      language,
      uiLanguage,
      setLanguage,
      languages: LANGUAGES,
      t: (key) => translate(uiLanguage, key),
      ts: (signName) => translateSign(uiLanguage, signName),
      copy,
    }
  }, [language, setLanguage])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
