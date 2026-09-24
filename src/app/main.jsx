import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import '../shared/lib/pwaInstall' // beforeinstallprompt hodisasini erta ushlab qolish uchun

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Minimal service worker (keshlamaydi): faqat "telefonga o'rnatish" uchun. Faqat production'da.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
