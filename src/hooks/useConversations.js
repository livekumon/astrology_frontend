import { useContext } from 'react'
import { ConversationContext } from '../contexts/conversationContext'

export function useConversations() {
  const ctx = useContext(ConversationContext)
  if (!ctx) throw new Error('useConversations must be used within ConversationProvider')
  return ctx
}
