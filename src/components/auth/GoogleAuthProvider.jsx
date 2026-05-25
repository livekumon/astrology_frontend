import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''

export default function GoogleAuthProvider({ children }) {
  if (!GOOGLE_CLIENT_ID) return children

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  )
}

export { GOOGLE_CLIENT_ID }
