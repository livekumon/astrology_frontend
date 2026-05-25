import { useEffect, useRef } from 'react'
import { useGoogleOAuth } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from './googleAuthConfig'

const BUTTON_HEIGHT = { large: 40, medium: 32, small: 20 }

let gsiInitialized = false
let activeCredentialHandler = null

function ensureGsiInitialized(clientId) {
  if (!window.google?.accounts?.id) return false

  if (!gsiInitialized) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (credentialResponse) => {
        activeCredentialHandler?.(credentialResponse)
      },
    })
    gsiInitialized = true
  }

  return true
}

export default function GoogleSignInButton({ onSuccess, onError, disabled = false, compact = false }) {
  const containerRef = useRef(null)
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth()

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !containerRef.current || disabled || !GOOGLE_CLIENT_ID) return

    const container = containerRef.current

    const handleCredential = (credentialResponse) => {
      if (credentialResponse?.credential) {
        onSuccess(credentialResponse.credential)
      } else {
        onError?.()
      }
    }

    if (!ensureGsiInitialized(clientId)) return

    const buttonOptions = {
      type: 'standard',
      theme: 'filled_black',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: compact ? '220' : '320',
      click_listener: () => {
        activeCredentialHandler = handleCredential
      },
    }

    window.google.accounts.id.renderButton(container, buttonOptions)

    return () => {
      if (activeCredentialHandler === handleCredential) {
        activeCredentialHandler = null
      }
      container.innerHTML = ''
    }
  }, [clientId, scriptLoadedSuccessfully, disabled, compact, onSuccess, onError])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div
      className={`auth-google-btn-wrap${disabled ? ' auth-google-disabled' : ''}${compact ? ' auth-google-btn-wrap-compact' : ''}`}
    >
      <div ref={containerRef} style={{ height: BUTTON_HEIGHT.large }} />
    </div>
  )
}
