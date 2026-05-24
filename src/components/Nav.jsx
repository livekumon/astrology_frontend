import { useEffect, useRef, useState } from 'react'
import { LANGUAGES } from '../constants/systems'
import { useLanguage } from '../i18n/LanguageContext'

export default function Nav({ onMenuClick }) {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const selectorRef = useRef(null)
  const activeLanguage = LANGUAGES.find((lang) => lang.code === language) || LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(code) {
    setLanguage(code)
    setOpen(false)
  }

  return (
    <nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="nav-menu-btn" onClick={onMenuClick} aria-label="Open menu">☰</button>
        <div>
          <div className="logo-nav">✦ JYOTISH</div>
          <div className="logo-tagline">{t('tagline')}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div ref={selectorRef} className={`lang-selector ${open ? 'open' : ''}`}>
          <button
            type="button"
            className="lang-trigger"
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((prev) => !prev)}
          >
            <div className="lang-dot" />
            <span>{activeLanguage.nativeLabel}</span>
            <span className={`lang-chevron ${open ? 'open' : ''}`}>▾</span>
          </button>
          <div className="lang-dropdown" role="listbox">
            {LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                role="option"
                aria-selected={language === lang.code}
                className={`lang-opt ${language === lang.code ? 'active' : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                {lang.icon} {lang.nativeLabel}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
