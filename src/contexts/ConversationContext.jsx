import { useCallback, useEffect, useState } from 'react'
import { apiUrl, parseJsonResponse } from '../api/config'
import { useAuth } from '../hooks/useAuth'
import { ConversationContext } from './conversationContext'

const emptyConversationValue = {
  conversations: [],
  activeConversation: null,
  loadingList: false,
  setActiveConversation: () => {},
  loadList: async () => {},
  createConversation: async () => null,
  loadConversation: async () => null,
  renameConversation: async () => false,
  deleteConversation: async () => {},
  appendMessages: async () => null,
}

function sameId(a, b) {
  if (a == null || b == null) return false
  return String(a) === String(b)
}

function ConversationProviderInner({ token, children }) {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [loadingList, setLoadingList] = useState(false)

  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  )

  const loadList = useCallback(async () => {
    if (!token) return
    setLoadingList(true)
    try {
      const res = await fetch(apiUrl('/conversations'), {
        headers: authHeader(),
      })
      if (!res.ok) return
      const data = await parseJsonResponse(res)
      setConversations(data.conversations || [])
    } finally {
      setLoadingList(false)
    }
  }, [token, authHeader])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      await loadList()
      if (cancelled) return
    })()

    return () => {
      cancelled = true
    }
  }, [loadList])

  const createConversation = useCallback(
    async (chartData, language, name) => {
      if (!token) return null
      const res = await fetch(apiUrl('/conversations'), {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartData, language, name: name || 'New Reading' }),
      })
      if (!res.ok) return null
      const data = await parseJsonResponse(res)
      const conv = data.conversation
      setConversations((prev) => [conv, ...prev])
      setActiveConversation(conv)
      return conv
    },
    [token, authHeader],
  )

  const loadConversation = useCallback(
    async (id) => {
      if (!token) return null
      const res = await fetch(apiUrl(`/conversations/${id}`), {
        headers: authHeader(),
      })
      if (!res.ok) return null
      const data = await parseJsonResponse(res)
      setActiveConversation(data.conversation)
      return data.conversation
    },
    [token, authHeader],
  )

  const renameConversation = useCallback(
    async (id, name) => {
      if (!token) return false
      const trimmed = name.trim()
      if (!trimmed) return false

      const res = await fetch(apiUrl(`/conversations/${id}`), {
        method: 'PATCH',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) return false
      const data = await parseJsonResponse(res)

      setConversations((prev) =>
        prev.map((c) => (sameId(c._id, id) ? { ...c, ...data.conversation } : c)),
      )

      setActiveConversation((prev) => {
        if (!prev || !sameId(prev._id, id)) return prev
        return {
          ...prev,
          ...data.conversation,
          messages: prev.messages ?? data.conversation.messages,
        }
      })
      return true
    },
    [token, authHeader],
  )

  const deleteConversation = useCallback(
    async (id) => {
      if (!token) return
      const res = await fetch(apiUrl(`/conversations/${id}`), {
        method: 'DELETE',
        headers: authHeader(),
      })
      if (!res.ok) return
      setConversations((prev) => prev.filter((c) => !sameId(c._id, id)))
      setActiveConversation((prev) => (sameId(prev?._id, id) ? null : prev))
    },
    [token, authHeader],
  )

  const appendMessages = useCallback(
    async (conversationId, userMessage, assistantMessage) => {
      if (!token) return null
      const res = await fetch(apiUrl(`/conversations/${conversationId}/messages`), {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, assistantMessage }),
      })
      if (!res.ok) return null
      const data = await parseJsonResponse(res)

      setActiveConversation((prev) => {
        if (!prev || !sameId(prev._id, conversationId)) return prev
        return {
          ...prev,
          compressedContext: data.compressedContext || prev.compressedContext,
          messageCount: (prev.messageCount || 0) + 1,
          messages: [
            ...(prev.messages || []),
            { role: 'user', content: userMessage, timestamp: new Date() },
            {
              role: 'assistant',
              summary: assistantMessage.summary,
              clearExplanation: assistantMessage.clearExplanation || '',
              detailedExplanation: assistantMessage.detailedExplanation,
              timestamp: new Date(),
            },
          ],
        }
      })

      setConversations((prev) => {
        const idx = prev.findIndex((c) => sameId(c._id, conversationId))
        if (idx < 0) return prev
        const updated = {
          ...prev[idx],
          messageCount: (prev[idx].messageCount || 0) + 1,
          updatedAt: new Date(),
        }
        return [updated, ...prev.filter((_, i) => i !== idx)]
      })

      return data.compressedContext
    },
    [token, authHeader],
  )

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        activeConversation,
        loadingList,
        setActiveConversation,
        loadList,
        createConversation,
        loadConversation,
        renameConversation,
        deleteConversation,
        appendMessages,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}

export function ConversationProvider({ children }) {
  const { user, token } = useAuth()

  if (!user || !token) {
    return (
      <ConversationContext.Provider value={emptyConversationValue}>
        {children}
      </ConversationContext.Provider>
    )
  }

  return (
    <ConversationProviderInner key={String(user._id)} token={token}>
      {children}
    </ConversationProviderInner>
  )
}
