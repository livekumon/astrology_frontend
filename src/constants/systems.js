export const LANGUAGES = [
  { code: 'en', nativeLabel: 'English', icon: '🌐' },
  { code: 'hi', nativeLabel: 'हिंदी', icon: '🇮🇳' },
  { code: 'te', nativeLabel: 'తెలుగు', icon: '🔷' },
  { code: 'ta', nativeLabel: 'தமிழ்', icon: '🌺' },
  { code: 'bn', nativeLabel: 'বাংলা', icon: '🌸' },
  { code: 'mr', nativeLabel: 'मराठी', icon: '🧡' },
  { code: 'pa', nativeLabel: 'ਪੰਜਾਬੀ', icon: '🌻' },
  { code: 'es', nativeLabel: 'Español', icon: '🌍' },
  { code: 'fr', nativeLabel: 'Français', icon: '🗼' },
  { code: 'zh', nativeLabel: '中文', icon: '🐉' },
]

export const DEFAULT_LANGUAGE = 'en'

export const LANGUAGE_STORAGE_KEY = 'jyotish_language'

export const UI_LANGUAGES = ['en', 'hi', 'te']

export const ASTROLOGY_SYSTEMS = [
  { id: 'South Indian Vedic', icon: '◈', labelKey: 'southIndian' },
  { id: 'North Indian Vedic', icon: '◇', labelKey: 'northIndian' },
  { id: 'Vedic / Jyotish', icon: '☽', labelKey: 'vedic' },
  { id: 'Western Tropical', icon: '☀', labelKey: 'western' },
  { id: 'Chinese BaZi', icon: '龙', labelKey: 'chinese' },
  { id: 'Tibetan Astrology', icon: '༄', labelKey: 'tibetan' },
  { id: 'Hellenistic', icon: 'Ω', labelKey: 'hellenistic' },
  { id: 'Numerology', icon: '∞', labelKey: 'numerology' },
  { id: 'Tarot Astrology', icon: '☆', labelKey: 'tarot' },
  { id: 'Mayan Astrology', icon: '✦', labelKey: 'mayan' },
  { id: 'Persian / Arabic', icon: '☪', labelKey: 'arabic' },
  { id: 'Sidereal Western', icon: '★', labelKey: 'sidereal' },
]

export function getSystemLabel(systemId, copySystems) {
  if (!systemId) return ''
  const entry = ASTROLOGY_SYSTEMS.find((s) => s.id === systemId)
  if (entry?.labelKey && copySystems?.[entry.labelKey]) return copySystems[entry.labelKey]
  return systemId
}

export function getSystemMeta(systemId) {
  return ASTROLOGY_SYSTEMS.find((s) => s.id === systemId) || null
}

export const CHART_TAB_IDS = ['rasi', 'navamsa', 'dasamsa', 'transit', 'dasha']

export const QUICK_QUESTION_KEYS = [
  'career',
  'marriage',
  'health',
  'finance',
  'dasha',
]
