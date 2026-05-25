import { useCallback, useMemo, useState } from 'react'
import { updateUserLanguage } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_STORAGE_KEY } from '../constants/systems'
import { getUiLanguage, translate, translateSign, translations } from './translations'
import { LanguageContext } from './languageContext'

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
  const [guestLanguage, setGuestLanguage] = useState(readStoredLanguage)

  const language = user?.language
    ? getUiLanguage(user.language)
    : getUiLanguage(guestLanguage)

  const setLanguage = useCallback(async (code) => {
    const next = getUiLanguage(code)
    setGuestLanguage(next)
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
