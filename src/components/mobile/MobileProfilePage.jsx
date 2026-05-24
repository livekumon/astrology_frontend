import { useState } from 'react'
import { LANGUAGES } from '../../constants/systems'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import AuthForms from '../auth/AuthForms'

export default function MobileProfilePage({ chartCast, onNewChart }) {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="mobile-page mobile-profile-page">
      <section className="mobile-profile-section">
        <h2 className="mobile-section-title">{t('navAccount')}</h2>
        {user ? (
          <div className="mobile-user-card">
            <div className="mobile-user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="mobile-user-info">
              <span className="mobile-user-name">{user.name}</span>
              <span className="mobile-user-email">{user.email}</span>
            </div>
            <button type="button" className="mobile-signout-btn" onClick={logout}>
              {t('signOut')}
            </button>
          </div>
        ) : (
          <div className="mobile-guest-card">
            <p className="mobile-guest-hint">{t('guestSidebarHint')}</p>
            {!showAuth ? (
              <button
                type="button"
                className="mobile-primary-btn"
                onClick={() => setShowAuth(true)}
              >
                {t('signInOrRegister')}
              </button>
            ) : (
              <>
                <AuthForms t={t} onClose={() => setShowAuth(false)} className="mobile-auth-forms" />
                <button
                  type="button"
                  className="mobile-text-btn"
                  onClick={() => setShowAuth(false)}
                >
                  {t('cancelRename')}
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <section className="mobile-profile-section">
        <h2 className="mobile-section-title">{t('mobileLanguage')}</h2>
        <div className="mobile-lang-grid">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`mobile-lang-btn${language === lang.code ? ' active' : ''}`}
              onClick={() => setLanguage(lang.code)}
            >
              <span className="mobile-lang-icon">{lang.icon}</span>
              <span>{lang.nativeLabel}</span>
            </button>
          ))}
        </div>
      </section>

      {chartCast && (
        <section className="mobile-profile-section">
          <button type="button" className="mobile-new-chart-btn" onClick={onNewChart}>
            ✦ {t('newChart')}
          </button>
        </section>
      )}

      <p className="mobile-footer-hint">✦ {t('footerHint')}</p>
    </div>
  )
}
