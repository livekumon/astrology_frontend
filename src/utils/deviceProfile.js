const DESKTOP_MQ = '(min-width: 1024px)'
const TABLET_MQ = '(min-width: 768px)'

export function detectDeviceType() {
  if (typeof window === 'undefined') return 'unknown'
  if (window.matchMedia(DESKTOP_MQ).matches) return 'desktop'
  if (window.matchMedia(TABLET_MQ).matches) return 'tablet'
  return 'mobile'
}

function readGeolocation() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 600000,
      },
    )
  })
}

export async function collectDeviceProfile() {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'unknown',
      userAgent: '',
      platform: '',
      location: null,
    }
  }

  const [location] = await Promise.all([readGeolocation()])

  return {
    deviceType: detectDeviceType(),
    userAgent: navigator.userAgent || '',
    platform: navigator.platform || '',
    location,
  }
}
