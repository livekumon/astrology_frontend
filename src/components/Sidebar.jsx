import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useConversations } from '../contexts/ConversationContext'
import { useLanguage } from '../i18n/LanguageContext'
import AuthForms from './auth/AuthForms'
import ConversationList from './conversations/ConversationList'

export default function Sidebar({
  open,
  isDesktop,
  onClose,
  onToggle,
  onSelectConversation,
  onNewChart,
}) {
  const { user, logout } = useAuth()
  const { t, copy } = useLanguage()
  const {
    conversations,
    activeConversation,
    loadingList,
    loadConversation,
    renameConversation,
    deleteConversation,
  } = useConversations()

  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    if (user) setShowAuth(false)
  }, [user])

  const handleSelect = useCallback(async (conv) => {
    const full = await loadConversation(conv._id)
    if (full) onSelectConversation?.(full)
    if (!isDesktop) onClose?.()
  }, [loadConversation, onSelectConversation, onClose, isDesktop])

  const handleNewChart = () => {
    onNewChart?.()
    if (!isDesktop) onClose?.()
  }

  return (
    <>
      {!isDesktop && open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside
        className={[
          'sidebar',
          isDesktop ? 'sidebar-desktop' : 'sidebar-mobile',
          open ? 'sidebar-open' : 'sidebar-closed',
        ].join(' ')}
        aria-hidden={!open}
      >
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <span className="sidebar-logo">✦ Jyotish</span>
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={isDesktop ? onToggle : onClose}
              aria-label={open ? t('closeMenu') : t('toggleSidebar')}
            >
              {isDesktop ? '‹' : '✕'}
            </button>
          </div>

          <button type="button" className="sidebar-new-chat-btn" onClick={handleNewChart}>
            <span className="sidebar-new-chat-icon">＋</span>
            {t('newChart')}
          </button>

          <div className="sidebar-user-section">
            {user ? (
              <div className="sidebar-user">
                <div className="sidebar-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{user.name}</span>
                  <span className="sidebar-user-email">{user.email}</span>
                </div>
                <button type="button" className="sidebar-logout-btn" onClick={logout} title={t('signOut')}>↪</button>
              </div>
            ) : (
              <div className="sidebar-guest">
                <p className="sidebar-guest-text">{t('guestSidebarHint')}</p>
                <button type="button" className="sidebar-signin-btn" onClick={() => setShowAuth((v) => !v)}>
                  {showAuth ? t('cancelRename') : t('signInOrRegister')}
                </button>
                {showAuth && <AuthForms onClose={() => setShowAuth(false)} t={t} />}
              </div>
            )}
          </div>

          {user && (
            <div className="sidebar-convs">
              <div className="sidebar-convs-header">
                <span className="sidebar-section-title">{t('conversations')}</span>
                {loadingList && <span className="sidebar-loading">…</span>}
              </div>

              <ConversationList
                conversations={conversations}
                activeConversation={activeConversation}
                loadingList={loadingList}
                onSelect={handleSelect}
                onRename={renameConversation}
                onDelete={deleteConversation}
                t={t}
                copy={copy}
              />
            </div>
          )}

          <div className="sidebar-footer">
            <p className="sidebar-footer-text">✦ {t('footerHint')}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
