const WHISPER_LANGUAGES = {
  en: 'english',
  hi: 'hindi',
  te: 'telugu',
  ta: 'tamil',
  bn: 'bengali',
  mr: 'marathi',
  pa: 'punjabi',
  es: 'spanish',
  fr: 'french',
  zh: 'chinese',
}

let transcriberPromise = null
let whisperAvailable = null

function getWhisperLanguage(languageCode) {
  return WHISPER_LANGUAGES[languageCode] || 'english'
}

function isSharedArrayBufferAvailable() {
  try {
    return typeof SharedArrayBuffer !== 'undefined'
  } catch {
    return false
  }
}

async function getTranscriber() {
  if (!isSharedArrayBufferAvailable()) {
    throw new Error('WHISPER_UNAVAILABLE')
  }

  if (!transcriberPromise) {
    transcriberPromise = import('@xenova/transformers').then(({ pipeline }) =>
      pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny'),
    )
  }

  return transcriberPromise
}

export async function checkWhisperAvailable() {
  if (whisperAvailable !== null) return whisperAvailable

  if (!isSharedArrayBufferAvailable()) {
    whisperAvailable = false
    return false
  }

  try {
    await getTranscriber()
    whisperAvailable = true
  } catch {
    whisperAvailable = false
  }

  return whisperAvailable
}

export async function transcribeAudioBlob(blob, language = 'en') {
  if (!isSharedArrayBufferAvailable()) {
    throw new Error('WHISPER_UNAVAILABLE')
  }

  const transcriber = await getTranscriber()
  const url = URL.createObjectURL(blob)

  try {
    const result = await transcriber(url, {
      language: getWhisperLanguage(language),
      task: 'transcribe',
    })

    return (result?.text || '').trim()
  } finally {
    URL.revokeObjectURL(url)
  }
}

// --- Web Speech API fallback ---

const WEB_SPEECH_LOCALES = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  pa: 'pa-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  zh: 'zh-CN',
}

export function getWebSpeechLocale(languageCode) {
  return WEB_SPEECH_LOCALES[languageCode] || 'en-IN'
}

export function hasWebSpeechSupport() {
  return typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function createWebSpeechRecognition(locale) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) throw new Error('Web Speech API not available')

  const recognition = new SR()
  recognition.lang = locale
  recognition.interimResults = true
  recognition.continuous = true
  recognition.maxAlternatives = 1
  return recognition
}
