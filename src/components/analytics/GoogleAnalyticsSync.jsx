import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { syncGoogleAnalytics } from '../../analytics/googleAnalytics'

export default function GoogleAnalyticsSync() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    let cancelled = false

    ;(async () => {
      if (cancelled) return
      await syncGoogleAnalytics(user)
    })()

    return () => {
      cancelled = true
    }
  }, [user, loading])

  return null
}
