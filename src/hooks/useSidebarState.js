import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'jyotish_sidebar_open'
const DESKTOP_MQ = '(min-width: 1024px)'

function readDesktop() {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches
}

function readInitialOpen() {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return readDesktop()
}

export function useSidebarState() {
  const [isDesktop, setIsDesktop] = useState(readDesktop)
  const [open, setOpen] = useState(readInitialOpen)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ)
    const onChange = (event) => setIsDesktop(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(open))
  }, [open])

  const toggle = useCallback(() => setOpen((value) => !value), [])
  const close = useCallback(() => setOpen(false), [])

  return { open, setOpen, toggle, close, isDesktop }
}
