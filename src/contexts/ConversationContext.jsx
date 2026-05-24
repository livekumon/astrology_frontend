import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'

const ConversationContext = createContext(null)

function sameId(a, b) {
  if (a == null || b == null) return false
  return String(a) === String(b)
}

export function ConversationProvider({ children }) {
  const { user, token } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const activeRef = useRef(null)
  activeRef.current = activeConversation

  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  )

  // Load list when user logs in
  useEffect(() => {
    if (!user) {
      setConversations([])
      setActiveConversation(null)
      return
    }
    loadList()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadList = useCallback(async () => {
    if (!token) return
    setLoadingList(true)
    try {
      const res = await fetch('/api/conversations', {
        headers: authHeader(),
      })
      if (!res.ok) return
      const data = await res.json()
      setConversations(data.conversations || [])
    } finally {
      setLoadingList(false)
    }
  }, [token, authHeader])

  const createConversation = useCallback(
    async (chartData, language, name) => {
      if (!token) return null
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartData, language, name: name || 'New Reading' }),
      })
      if (!res.ok) return null
      const data = await res.json()
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
      const res = await fetch(`/api/conversations/${id}`, {
        headers: authHeader(),
      })
      if (!res.ok) return null
      const data = await res.json()
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

      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) return false
      const data = await res.json()

      setConversations((prev) =>
        prev.map((c) => (sameId(c._id, id) ? { ...c, ...data.conversation } : c)),
      )

      if (sameId(activeRef.current?._id, id)) {
        setActiveConversation((prev) =>
          prev ? { ...prev, ...data.conversation, messages: prev.messages ?? data.conversation.messages } : data.conversation,
        )
      }
      return true
    },
    [token, authHeader],
  )

  const deleteConversation = useCallback(
    async (id) => {
      if (!token) return
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      })
      if (!res.ok) return
      setConversations((prev) => prev.filter((c) => !sameId(c._id, id)))
      if (sameId(activeRef.current?._id, id)) setActiveConversation(null)
    },
    [token, authHeader],
  )

  const appendMessages = useCallback(
    async (conversationId, userMessage, assistantMessage) => {
      if (!token) return null
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, assistantMessage }),
      })
      if (!res.ok) return null
      const data = await res.json()

      // Update local active conversation messages
      setActiveConversation((prev) => {
        if (!prev || !sameId(prev._id, conversationId)) return prev
        return {
          ...prev,
          compressedContext: data.compressedContext || prev.compressedContext,
          messageCount: (prev.messageCount || 0) + 1,
          messages: [
            ...(prev.messages || []),
            { role: 'user', content: userMessage, timestamp: new Date() },
            { role: 'assistant', summary: assistantMessage.summary, clearExplanation: assistantMessage.clearExplanation || '', detailedExplanation: assistantMessage.detailedExplanation, timestamp: new Date() },
          ],
        }
      })

      // Bump conversation to top of list
      setConversations((prev) => {
        const idx = prev.findIndex((c) => sameId(c._id, conversationId))
        if (idx < 0) return prev
        const updated = { ...prev[idx], messageCount: (prev[idx].messageCount || 0) + 1, updatedAt: new Date() }
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

export function useConversations() {
  const ctx = useContext(ConversationContext)
  if (!ctx) throw new Error('useConversations must be used within ConversationProvider')
  return ctx
}
