// Saytni telefonga o'rnatish: Android'da brauzerning o'rnatish taklifi (beforeinstallprompt),
// iPhone'da avtomatik o'rnatish yo'q, shuning uchun ko'rsatma beriladi.
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'rulda_install_prompt' // 'dismissed' | 'installed'

let deferredPrompt = null
const listeners = new Set()
const notify = () => listeners.forEach((listener) => listener())

function setFlag(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // localStorage yopiq bo'lsa, karta keyingi safar yana chiqishi mumkin.
  }
}

function getFlag() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

// Hodisa sahifa yuklanishining boshida keladi, shuning uchun uni darhol ushlab qolamiz.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    setFlag('installed')
    notify()
  })
}

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function isIosSafari() {
  const ua = window.navigator.userAgent
  const isIos =
    /iPhone|iPad|iPod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
  return isIos && isSafari
}

// Karta ko'rsatiladimi: 'android' (o'rnatish tugmasi) | 'ios' (ko'rsatma) | null
export function useInstallPrompt() {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1)
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  const dismiss = () => {
    setFlag('dismissed')
    forceUpdate((n) => n + 1)
  }

  const install = async () => {
    if (!deferredPrompt) return
    const promptEvent = deferredPrompt
    deferredPrompt = null
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    setFlag(outcome === 'accepted' ? 'installed' : 'dismissed')
    forceUpdate((n) => n + 1)
  }

  let kind = null
  if (!getFlag() && !isStandalone()) {
    if (deferredPrompt) kind = 'android'
    else if (isIosSafari()) kind = 'ios'
  }

  return { kind, install, dismiss }
}
