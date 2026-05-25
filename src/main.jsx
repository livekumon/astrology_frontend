import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import GoogleAuthProvider from './components/auth/GoogleAuthProvider.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ConversationProvider } from './contexts/ConversationContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleAuthProvider>
      <AuthProvider>
        <LanguageProvider>
          <ConversationProvider>
            <App />
          </ConversationProvider>
        </LanguageProvider>
      </AuthProvider>
    </GoogleAuthProvider>
  </StrictMode>,
)
