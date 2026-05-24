import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthForms({ onClose, t, className = '' }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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

  return (
    <div className={`auth-forms${className ? ` ${className}` : ''}`}>
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => { setMode('login'); setError('') }}
        >
          {t('signIn')}
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => { setMode('register'); setError('') }}
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
          />
        )}
        <input
          className="auth-input"
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="auth-input"
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="auth-error">{error}</p>}
        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? '…' : mode === 'login' ? t('signIn') : t('createAccount')}
        </button>
      </form>
    </div>
  )
}
