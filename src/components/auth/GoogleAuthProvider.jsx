import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from './googleAuthConfig'

export default function GoogleAuthProvider({ children }) {
  if (!GOOGLE_CLIENT_ID) return children

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  )
}

export { GOOGLE_CLIENT_ID } from './googleAuthConfig'
