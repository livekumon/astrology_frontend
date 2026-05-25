import { GoogleLogin } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''

export function isGoogleSignInEnabled() {
  return Boolean(GOOGLE_CLIENT_ID)
}

export default function GoogleSignInButton({ onSuccess, onError, disabled = false }) {
  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className={`auth-google-btn-wrap${disabled ? ' auth-google-disabled' : ''}`}>
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) onSuccess(response.credential)
          else onError?.()
        }}
        onError={() => onError?.()}
        theme="filled_black"
        size="large"
        width="320"
        text="continue_with"
        shape="rectangular"
        useOneTap={false}
      />
    </div>
  )
}
