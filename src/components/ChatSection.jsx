import { useCallback, useEffect, useRef, useState } from 'react'
import { QUICK_QUESTION_KEYS } from '../constants/systems'
import { sendChatMessage } from '../api/client'
import { useLanguage } from '../hooks/useLanguage'
import { useAuth } from '../hooks/useAuth'
import { useConversations } from '../hooks/useConversations'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useMicrophoneDevices } from '../hooks/useMicrophoneDevices'
import DetailedExplanationModal from './DetailedExplanationModal'
import MicIcon from './MicIcon'
import AuthForms from './auth/AuthForms'

function renderMessage(text) {
  const parts = text.split(/(<em>.*?<\/em>)/g)
  return parts.map((part, i) => {
    const match = part.match(/^<em>(.*?)<\/em>$/)
    if (match) return <em key={i}>{match[1]}</em>
    return part
  })
}

function buildChartContext(chartData, language) {
  if (!chartData) return { language }
  return {
    system: chartData.system,
    dateOfBirth: chartData.dateOfBirth,
    timeOfBirth: chartData.timeOfBirth,
    placeOfBirth: chartData.placeOfBirth,
    gender: chartData.gender,
    birthLocation: chartData.birthLocation,
    chartCalculation: chartData.chartCalculation,
    sunSign: chartData.sunSign,
    moonSign: chartData.moonSign,
    ascSign: chartData.ascSign,
    planets: chartData.planets,
    dashas: chartData.dashas,
    navamsa: chartData.navamsa,
    dasamsa: chartData.dasamsa,
    transit: chartData.transit,
    welcomeMessage: chartData.welcomeMessage,
    language,
  }
}

function hasDetailedExplanation(detailedExplanation) {
  if (!detailedExplanation) return false
  return Object.values(detailedExplanation).some((items) => Array.isArray(items) && items.length > 0)
}

function savedMessageToUi(msg, index, all) {
  if (msg.role === 'user') return { role: 'user', text: msg.content }
  const prevUser = all[index - 1]
  return {
    role: 'assistant',
    text: msg.summary || '',
    clearExplanation: msg.clearExplanation || '',
    question: prevUser?.role === 'user' ? prevUser.content : undefined,
    detailedExplanation: msg.detailedExplanation,
  }
}

function buildInitialMessages(conversation, chartData) {
  if (conversation?.messages?.length) {
    return conversation.messages.map((msg, index, all) => savedMessageToUi(msg, index, all))
  }
  if (chartData?.welcomeMessage) {
    return [{ role: 'assistant', text: chartData.welcomeMessage }]
  }
  return []
}

function ConvNameBarEditor({ conversation, onRename, t }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(conversation.name || '')

  async function commit() {
    const next = draft.trim()
    if (!next) {
      setDraft(conversation.name || '')
      setEditing(false)
      return
    }
    if (next !== conversation.name) await onRename(conversation._id, next)
    setEditing(false)
  }

  return (
    <div className="chat-header-bar">
      {editing ? (
        <input
          className="chat-header-title-input"
          value={draft}
          autoFocus
          placeholder={t('conversationNamePlaceholder')}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') { setDraft(conversation.name); setEditing(false) }
          }}
        />
      ) : (
        <button type="button" className="chat-header-title" onClick={() => setEditing(true)} title={t('clickToRename')}>
          {conversation.name}
        </button>
      )}
      {conversation.compressedContext && (
        <span className="chat-header-badge">{t('continuingContext')}</span>
      )}
    </div>
  )
}

function ConvNameBar({ conversation, onRename, t }) {
  if (!conversation) return null
  return (
    <ConvNameBarEditor
      key={String(conversation._id)}
      conversation={conversation}
      onRename={onRename}
      t={t}
    />
  )
}

function ChatSectionInner({
  chartData,
  visible,
  conversation: externalConversation,
  sectionRef,
  fullHeight = false,
}) {
  const { copy, t, language } = useLanguage()
  const { user } = useAuth()
  const { activeConversation, appendMessages, renameConversation } = useConversations()

  const conversation = externalConversation || activeConversation

  const [messages, setMessages] = useState(() => buildInitialMessages(conversation, chartData))
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [activeDetail, setActiveDetail] = useState(null)
  const [voiceError, setVoiceError] = useState('')
  const messagesRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, sending])

  useEffect(() => {
    if (!fullHeight || !textareaRef.current) return
    const el = textareaRef.current
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input, fullHeight])

  const {
    isSupported: micDevicesSupported,
    openSelectedMic,
    releaseStream,
    getMicStream,
  } = useMicrophoneDevices()

  const { isSupported: voiceSupported, isListening, isProcessing, toggleListening } = useVoiceInput({
    language,
    getBaseText: () => input,
    getMicStream,
    openSelectedMic,
    releaseMicStream: releaseStream,
    onTextChange: (text) => { setVoiceError(''); setInput(text) },
    onError: (message) => setVoiceError(message || ''),
  })

  const isSupported = voiceSupported && micDevicesSupported
  const userMessageCount = messages.filter((m) => m.role === 'user').length
  const showSuggestions = userMessageCount === 0

  const handleSend = useCallback(async (question) => {
    const text = question.trim()
    if (!text || sending || !user) return

    const history = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      text: msg.text,
    }))

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setSending(true)

    try {
      const result = await sendChatMessage({
        question: text,
        language,
        history,
        chartContext: buildChartContext(chartData, language),
        compressedContext: conversation?.compressedContext || '',
        conversationId: conversation?._id || undefined,
      })

      const assistantMsg = {
        role: 'assistant',
        text: result.summary || result.answer,
        clearExplanation: result.clearExplanation || '',
        question: text,
        detailedExplanation: result.detailedExplanation,
      }

      setMessages((prev) => [...prev, assistantMsg])

      if (user && conversation?._id) {
        await appendMessages(conversation._id, text, {
          summary: result.summary || result.answer,
          clearExplanation: result.clearExplanation || '',
          detailedExplanation: result.detailedExplanation,
        })
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: t('chatError') }])
    } finally {
      setSending(false)
    }
  }, [sending, messages, language, chartData, conversation, user, appendMessages, t])

  function handleComposerKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  if (!visible) return null

  if (fullHeight) {
    return (
      <>
        <div className="chat-layout" ref={sectionRef}>
          <div className="chat-header">
            {conversation && user ? (
              <ConvNameBar conversation={conversation} onRename={renameConversation} t={t} />
            ) : (
              <div className="chat-header-bar">
                <span className="chat-header-title-static">{t('askAstrologer')}</span>
              </div>
            )}
            {!user && <p className="chat-header-hint">{t('signInToContinueChat')}</p>}
          </div>

          <div className="chat-scroll" ref={messagesRef}>
            <div className="chat-thread">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-turn chat-turn-${msg.role}${sending && i === messages.length - 1 && msg.role === 'user' ? ' chat-turn-pending' : ''}`}>
                  <div className="chat-turn-label">{msg.role === 'user' ? t('you') : '✦ Jyotish'}</div>
                  <div className={`chat-bubble chat-bubble-${msg.role}`}>
                    <div className="chat-bubble-text">{renderMessage(msg.text)}</div>
                    {msg.role === 'assistant' && msg.clearExplanation && (
                      <div className="chat-bubble-clear">{renderMessage(msg.clearExplanation)}</div>
                    )}
                    {msg.role === 'assistant' && hasDetailedExplanation(msg.detailedExplanation) && (
                      <button
                        type="button"
                        className="detail-trigger"
                        onClick={() => setActiveDetail({ question: msg.question, detailedExplanation: msg.detailedExplanation })}
                      >
                        {t('detailedExplanation')}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="chat-turn chat-turn-assistant">
                  <div className="chat-turn-label">✦ Jyotish</div>
                  <div className="chat-bubble chat-bubble-assistant chat-bubble-typing">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}

              {showSuggestions && user && (
                <div className="chat-suggestions">
                  {QUICK_QUESTION_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className="chat-suggestion-chip"
                      onClick={() => handleSend(copy.quickQuestions[key])}
                      disabled={sending}
                    >
                      {copy.quickQuestions[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!user ? (
            <div className="chat-auth-gate">
              <p className="chat-auth-gate-text">{t('signInToContinueChat')}</p>
              <AuthForms t={t} className="chat-auth-gate-forms" />
            </div>
          ) : (
          <div className="chat-composer">
            <div className="chat-composer-inner">
              <div className={`chat-composer-box${isListening ? ' listening' : ''}`}>
                {isSupported && (
                  <button
                    type="button"
                    className={`chat-composer-mic${isListening ? ' active' : ''}${isProcessing ? ' processing' : ''}`}
                    disabled={sending || (isProcessing && !isListening)}
                    onClick={() => { setVoiceError(''); toggleListening() }}
                    aria-label={isProcessing ? t('voiceInputProcessing') : isListening ? t('voiceInputStop') : t('voiceInputStart')}
                  >
                    <MicIcon listening={isListening || isProcessing} />
                  </button>
                )}
                <textarea
                  ref={textareaRef}
                  className="chat-composer-input"
                  rows={1}
                  placeholder={
                    isProcessing
                      ? t('voiceInputProcessing')
                      : isListening
                        ? t('voiceInputListening')
                        : t('chatPlaceholder')
                  }
                  value={input}
                  disabled={sending || isListening || isProcessing}
                  readOnly={isListening || isProcessing}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                />
                <button
                  type="button"
                  className="chat-composer-send"
                  disabled={sending || isListening || !input.trim()}
                  onClick={() => handleSend(input)}
                  aria-label={t('chatSend')}
                >
                  ↑
                </button>
              </div>
              {voiceError && <div className="chat-voice-error">{voiceError}</div>}
              <p className="chat-composer-disclaimer">{t('footerHint')}</p>
            </div>
          </div>
          )}
        </div>

        <DetailedExplanationModal
          open={!!activeDetail}
          onClose={() => setActiveDetail(null)}
          question={activeDetail?.question}
          detailedExplanation={activeDetail?.detailedExplanation}
        />
      </>
    )
  }

  return (
    <>
      <div className="chat-section visible" ref={sectionRef}>
        <div className="section-label">{t('askAstrologer')}</div>
        <div className="chat-box">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role === 'user' ? 'user' : 'system'}`}>
                <div className="msg-avatar">{msg.role === 'user' ? '✿' : '✦'}</div>
                <div className="msg-content">
                  <div className="msg-text">{renderMessage(msg.text)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ChatSection(props) {
  const conversation = props.conversation
  const resetKey = conversation?._id ?? props.chartData?.welcomeMessage ?? 'empty'
  return <ChatSectionInner key={resetKey} {...props} />
}
