import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import GoogleSignInButton from './GoogleSignInButton'
import { isGoogleSignInEnabled } from './googleAuthConfig'

export default function AuthForms({ onClose, t, className = '' }) {
  const { login, register, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const googleEnabled = isGoogleSignInEnabled()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(name, email, password)
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleSuccess(credential) {
    setError('')
    setBusy(true)
    try {
      await loginWithGoogle(credential)
      onClose?.()
    } catch (err) {
      setError(err.message || t('googleSignInFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`auth-forms${className ? ` ${className}` : ''}`}>
      {googleEnabled && (
        <>
          <GoogleSignInButton
            compact={className.includes('mobile-auth-forms') || className.includes('chat-auth-gate')}
            disabled={busy}
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t('googleSignInFailed'))}
          />
          <div className="auth-divider">
            <span>{t('orContinueWithEmail')}</span>
          </div>
        </>
      )}

      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => { setMode('login'); setError('') }}
          disabled={busy}
        >
          {t('signIn')}
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => { setMode('register'); setError('') }}
          disabled={busy}
        >
          {t('register')}
        </button>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            className="auth-input"
            type="text"
            placeholder={t('yourName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={busy}
          />
        )}
        <input
          className="auth-input"
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={busy}
        />
        <input
          className="auth-input"
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={busy}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {error && <p className="auth-error">{error}</p>}
        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? '…' : mode === 'login' ? t('signIn') : t('createAccount')}
        </button>
      </form>
    </div>
  )
}
