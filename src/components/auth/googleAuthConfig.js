export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''

export function isGoogleSignInEnabled() {
  return Boolean(GOOGLE_CLIENT_ID)
}
