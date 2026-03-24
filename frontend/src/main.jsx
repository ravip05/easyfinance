import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider }  from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { LeadsProvider } from './context/LeadsContext'
import './tailwind.css'
import './crm.css'

// Register PWA service worker
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/*
       * Provider nesting order matters:
       *   BrowserRouter   — must be outermost (hooks use React Router context)
       *   AuthProvider    — reads/writes sessionStorage; no deps
       *   ToastProvider   — renders the toast container; needed by LeadsProvider
       *   LeadsProvider   — calls the API on mount; needs Auth + Toast
       *
       * LeadsProvider lives here (not inside each page) so the leads array
       * is shared between /leads and /pipeline without a double-fetch.
       * This mirrors the prototype's global LEADS array.
       */}
      <AuthProvider>
        <ToastProvider>
          <LeadsProvider>
            <App />
          </LeadsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
