const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || 'G-812K9FQ5NE'

const EXCLUDED_EMAILS = (import.meta.env.VITE_GA_EXCLUDED_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const EXCLUDED_IPS = (import.meta.env.VITE_GA_EXCLUDED_IPS || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean)

const IP_CACHE_KEY = 'jyotish_ga_public_ip'

let scriptPromise = null
let analyticsEnabled = false
let ipCheckPromise = null

function isProduction() {
  return import.meta.env.PROD
}

export function isExcludedEmail(email) {
  if (!email) return false
  return EXCLUDED_EMAILS.includes(String(email).trim().toLowerCase())
}

function setGaDisabled(disabled) {
  if (typeof window === 'undefined' || !MEASUREMENT_ID) return
  window[`ga-disable-${MEASUREMENT_ID}`] = disabled
}

function ensureGtagStub() {
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
  }
}

function loadGtagScript() {
  if (!MEASUREMENT_ID || typeof document === 'undefined') {
    return Promise.resolve(false)
  }

  if (window[`ga-disable-${MEASUREMENT_ID}`]) {
    return Promise.resolve(false)
  }

  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve) => {
    ensureGtagStub()

    const existing = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`)
    if (existing) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })

  return scriptPromise
}

async function resolvePublicIp() {
  if (!EXCLUDED_IPS.length || typeof window === 'undefined') return null

  const cached = sessionStorage.getItem(IP_CACHE_KEY)
  if (cached) return cached

  if (!ipCheckPromise) {
    ipCheckPromise = fetch('https://api.ipify.org?format=json')
      .then(async (response) => (response.ok ? response.json() : null))
      .then((data) => {
        const ip = data?.ip ? String(data.ip) : null
        if (ip) sessionStorage.setItem(IP_CACHE_KEY, ip)
        return ip
      })
      .catch(() => null)
      .finally(() => {
        ipCheckPromise = null
      })
  }

  return ipCheckPromise
}

async function isExcludedNetwork() {
  if (!EXCLUDED_IPS.length) return false
  const ip = await resolvePublicIp()
  return Boolean(ip && EXCLUDED_IPS.includes(ip))
}

export async function shouldExcludeAnalytics(user) {
  if (!isProduction()) return true
  if (isExcludedEmail(user?.email)) return true
  if (await isExcludedNetwork()) return true
  return false
}

export function disableGoogleAnalytics() {
  setGaDisabled(true)
  analyticsEnabled = false

  if (typeof window.gtag === 'function' && MEASUREMENT_ID) {
    window.gtag('consent', 'update', { analytics_storage: 'denied' })
  }
}

export async function syncGoogleAnalytics(user) {
  if (!isProduction() || !MEASUREMENT_ID) {
    disableGoogleAnalytics()
    return
  }

  if (await shouldExcludeAnalytics(user)) {
    disableGoogleAnalytics()
    return
  }

  setGaDisabled(false)
  const loaded = await loadGtagScript()
  if (!loaded || window[`ga-disable-${MEASUREMENT_ID}`]) return

  ensureGtagStub()
  window.gtag('js', new Date())

  const config = {}
  if (user?._id) {
    config.user_id = String(user._id)
  }

  window.gtag('config', MEASUREMENT_ID, config)
  window.gtag('consent', 'update', { analytics_storage: 'granted' })
  analyticsEnabled = true
}

export function isGoogleAnalyticsEnabled() {
  return analyticsEnabled
}

export { MEASUREMENT_ID, EXCLUDED_EMAILS, EXCLUDED_IPS }
