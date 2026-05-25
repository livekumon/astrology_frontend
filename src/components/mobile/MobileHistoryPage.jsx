import { useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useConversations } from '../../hooks/useConversations'
import { useLanguage } from '../../hooks/useLanguage'
import ConversationList from '../conversations/ConversationList'
import AuthForms from '../auth/AuthForms'

export default function MobileHistoryPage({ onSelectConversation, onNavigateChat }) {
  const { user } = useAuth()
  const { t, copy } = useLanguage()
  const {
    conversations,
    activeConversation,
    loadingList,
    loadConversation,
    renameConversation,
    deleteConversation,
  } = useConversations()

  const handleSelect = useCallback(async (conv) => {
    const full = await loadConversation(conv._id)
    if (full) {
      onSelectConversation?.(full)
      onNavigateChat?.()
    }
  }, [loadConversation, onSelectConversation, onNavigateChat])

  if (!user) {
    return (
      <div className="mobile-page mobile-history-page">
        <div className="mobile-page-card mobile-guest-card">
          <p className="mobile-guest-title">{t('signInToSave')}</p>
          <p className="mobile-guest-hint">{t('guestSidebarHint')}</p>
          <AuthForms t={t} className="mobile-auth-forms" />
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-page mobile-history-page">
      <div className="mobile-page-intro">
        <h2>{t('conversations')}</h2>
        <p>{t('mobileHistoryHint')}</p>
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
        className="mobile-conv-list"
      />
    </div>
  )
}
