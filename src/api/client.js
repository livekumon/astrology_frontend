import { apiUrl, parseJsonResponse } from './config'

function getToken() {
  return localStorage.getItem('jyotish_token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }

  return data
}

export function generateChart(payload) {
  return request('/chart', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function sendChatMessage(payload) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function checkHealth() {
  return request('/health')
}

// ─── Conversations ────────────────────────────────────────────────────────────

export function listConversations() {
  return request('/conversations')
}

export function createConversation(payload) {
  return request('/conversations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getConversation(id) {
  return request(`/conversations/${id}`)
}

export function renameConversation(id, name) {
  return request(`/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
}

export function deleteConversation(id) {
  return request(`/conversations/${id}`, {
    method: 'DELETE',
  })
}

export function appendMessages(conversationId, userMessage, assistantMessage) {
  return request(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ userMessage, assistantMessage }),
  })
}

export function updateUserLanguage(language) {
  return request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ language }),
  })
}
