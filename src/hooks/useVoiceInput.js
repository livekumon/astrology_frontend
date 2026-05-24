import { useCallback, useEffect, useRef, useState } from 'react'
import {
  checkWhisperAvailable,
  createWebSpeechRecognition,
  getWebSpeechLocale,
  hasWebSpeechSupport,
  transcribeAudioBlob,
} from '../services/browserSpeechService'

function mapError(error) {
  const msg = error?.message || String(error || '')
  if (/permission|not allowed|denied/i.test(msg)) return 'Microphone permission was denied.'
  if (/no audio|empty/i.test(msg)) return 'No speech detected. Try again.'
  if (msg === 'WHISPER_UNAVAILABLE') return null // handled by fallback
  return msg || 'Voice recognition failed. Try again.'
}

function buildTranscriptFromResults(results) {
  let final = ''
  let interim = ''
  for (let i = 0; i < results.length; i += 1) {
    const text = results[i][0]?.transcript || ''
    if (results[i].isFinal) final += text
    else interim += text
  }
  return (final + interim).trim()
}

export function useVoiceInput({
  language,
  getBaseText,
  onTextChange,
  onError,
  getMicStream,
  openSelectedMic,
  releaseMicStream,
}) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mode, setMode] = useState(null) // 'whisper' | 'webspeech' | null

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const mimeTypeRef = useRef('audio/webm')
  const transcribeQueueRef = useRef(Promise.resolve())
  const listeningRef = useRef(false)
  const baseTextRef = useRef('')
  const recognitionRef = useRef(null)

  const isSupported =
    (typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined') ||
    hasWebSpeechSupport()

  // Detect which mode to use once on mount
  useEffect(() => {
    checkWhisperAvailable().then((ok) => {
      if (ok) {
        setMode('whisper')
      } else if (hasWebSpeechSupport()) {
        setMode('webspeech')
      }
    })
  }, [])

  // ── Whisper path ────────────────────────────────────────────────────────────

  const stopRecorder = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const queueTranscription = useCallback(
    (blob) => {
      if (!blob?.size) return transcribeQueueRef.current

      transcribeQueueRef.current = transcribeQueueRef.current
        .then(async () => {
          setIsProcessing(true)
          const transcript = await transcribeAudioBlob(blob, language)
          if (!transcript) return

          const combined = [baseTextRef.current, transcript]
            .filter(Boolean)
            .join(baseTextRef.current && transcript ? ' ' : '')
          onTextChange?.(combined)
        })
        .catch((error) => {
          const msg = mapError(error)
          if (msg) onError?.(msg)
        })
        .finally(() => {
          if (!listeningRef.current) setIsProcessing(false)
        })

      return transcribeQueueRef.current
    },
    [language, onError, onTextChange],
  )

  const startWhisper = useCallback(async () => {
    onError?.('')
    baseTextRef.current = getBaseText?.().trim() || ''

    let stream = getMicStream?.()
    if (!stream || stream.getAudioTracks().every((t) => t.readyState !== 'live')) {
      try {
        stream = await openSelectedMic?.()
      } catch (err) {
        onError?.(mapError(err) || 'Could not open microphone.')
        return
      }
    }
    if (!stream) { onError?.('Could not open the selected microphone.'); return }

    chunksRef.current = []
    mimeTypeRef.current = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const recorder = new MediaRecorder(stream, { mimeType: mimeTypeRef.current })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
        queueTranscription(new Blob(chunksRef.current, { type: mimeTypeRef.current }))
      }
    }

    recorder.onstop = async () => {
      mediaRecorderRef.current = null
      const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })
      chunksRef.current = []
      if (blob.size > 0) await queueTranscription(blob)
      await transcribeQueueRef.current
      listeningRef.current = false
      setIsListening(false)
      setIsProcessing(false)
      releaseMicStream?.()
    }

    recorder.onerror = () => {
      onError?.('Could not record from the selected microphone.')
      listeningRef.current = false
      setIsListening(false)
      releaseMicStream?.()
    }

    listeningRef.current = true
    recorder.start(2500)
    setIsListening(true)
  }, [getBaseText, getMicStream, onError, openSelectedMic, queueTranscription, releaseMicStream])

  // ── Web Speech path ─────────────────────────────────────────────────────────

  const stopWebSpeech = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null
      recognitionRef.current.onerror = null
      recognitionRef.current.onend = null
      try { recognitionRef.current.stop() } catch { /* ignore */ }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const startWebSpeech = useCallback(() => {
    onError?.('')
    baseTextRef.current = getBaseText?.().trim() || ''

    const locale = getWebSpeechLocale(language)
    let recognition
    try {
      recognition = createWebSpeechRecognition(locale)
    } catch {
      onError?.('Voice recognition is not available in this browser.')
      return
    }
    recognitionRef.current = recognition

    recognition.onresult = (event) => {
      const spoken = buildTranscriptFromResults(event.results)
      const base = baseTextRef.current.trim()
      const combined = [base, spoken].filter(Boolean).join(base && spoken ? ' ' : '')
      onTextChange?.(combined)
    }

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return
      const msgs = {
        'not-allowed': 'Microphone permission was denied.',
        'no-speech': 'No speech detected. Try again.',
        'audio-capture': 'No microphone found.',
        'network': 'Voice recognition needs a network connection.',
      }
      onError?.(msgs[event.error] || 'Voice recognition failed.')
      stopWebSpeech()
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setIsListening(false)
    }

    recognition.start()
    setIsListening(true)
  }, [getBaseText, language, onError, onTextChange, stopWebSpeech])

  // ── Unified toggle ───────────────────────────────────────────────────────────

  const toggleListening = useCallback(() => {
    if (isProcessing && !isListening) return

    if (isListening) {
      if (mode === 'webspeech') stopWebSpeech()
      else stopRecorder()
      return
    }

    if (mode === 'whisper') startWhisper()
    else if (mode === 'webspeech') startWebSpeech()
    else onError?.('Voice input is not available in this browser.')
  }, [
    isListening,
    isProcessing,
    mode,
    onError,
    startWebSpeech,
    startWhisper,
    stopRecorder,
    stopWebSpeech,
  ])

  // cleanup on unmount
  useEffect(() => () => {
    listeningRef.current = false
    stopRecorder()
    stopWebSpeech()
    releaseMicStream?.()
  }, [releaseMicStream, stopRecorder, stopWebSpeech])

  return {
    isSupported,
    isListening,
    isProcessing,
    mode,
    toggleListening,
  }
}
