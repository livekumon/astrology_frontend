import { useState } from 'react'
import { getSystemLabel, getSystemMeta } from '../../constants/systems'

function ConvItem({ conv, isActive, onSelect, onRename, onDelete, t, copy }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(conv.name)

  function startEditing(e) {
    e?.stopPropagation()
    setDraft(conv.name)
    setEditing(true)
  }

  async function commitRename(e) {
    e?.stopPropagation()
    const next = draft.trim()
    if (!next) { setDraft(conv.name); setEditing(false); return }
    if (next !== conv.name) await onRename(conv._id, next)
    setEditing(false)
  }

  const date = conv.updatedAt
    ? new Date(conv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : ''
  const systemId = conv.chartData?.system
  const systemMeta = getSystemMeta(systemId)
  const traditionLabel = getSystemLabel(systemId, copy.systems)

  return (
    <div className={`conv-item ${isActive ? 'active' : ''} ${editing ? 'editing' : ''}`}>
      {editing ? (
        <div className="conv-edit-row" onClick={(e) => e.stopPropagation()}>
          <input
            className="conv-rename-input"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename(e)
              if (e.key === 'Escape') setEditing(false)
            }}
          />
          <div className="conv-edit-actions">
            <button type="button" className="conv-edit-save" onClick={commitRename}>
              {t('saveName')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <button type="button" className="conv-item-main" onClick={() => onSelect(conv)}>
            <span className="conv-name">{conv.name}</span>
            {traditionLabel && (
              <span className="conv-tradition">
                {systemMeta?.icon && <span className="conv-tradition-icon">{systemMeta.icon}</span>}
                {traditionLabel}
              </span>
            )}
            <span className="conv-date">{date}</span>
          </button>
          <div className="conv-actions">
            <button
              type="button"
              className="conv-action-btn"
              title={t('renameConversation')}
              onClick={startEditing}
            >
              ✏️
            </button>
            <button
              type="button"
              className="conv-action-btn conv-delete-btn"
              title={t('deleteConversation')}
              onClick={(e) => { e.stopPropagation(); onDelete(conv._id) }}
            >
              🗑
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function ConversationList({
  conversations,
  activeConversation,
  loadingList,
  onSelect,
  onRename,
  onDelete,
  t,
  copy,
  emptyText,
  className = '',
}) {
  return (
    <div className={`conversation-list${className ? ` ${className}` : ''}`}>
      {loadingList && <p className="conversation-list-loading">{t('loadingConversations')}</p>}

      {!loadingList && conversations.length === 0 && (
        <p className="conversation-list-empty">{emptyText || t('sidebarEmpty')}</p>
      )}

      <div className="sidebar-conv-list">
        {conversations.map((conv) => (
          <ConvItem
            key={String(conv._id)}
            conv={conv}
            isActive={
              activeConversation?._id != null
              && String(activeConversation._id) === String(conv._id)
            }
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
            t={t}
            copy={copy}
          />
        ))}
      </div>
    </div>
  )
}
