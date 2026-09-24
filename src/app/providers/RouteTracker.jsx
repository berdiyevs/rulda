import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initAnalytics, trackPageView } from '../../shared/lib/analytics'
import { ROUTES } from '../../shared/config/routes'

// SPA'da har bir sahifa o'zgarishini analitikaga yuboradi.
// Faqat pathname yuboriladi. Email tasdiqlash sahifasida (URL'da maxfiy token bor) analitika umuman ishga tushirilmaydi.
export function RouteTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === ROUTES.VERIFY_EMAIL) return
    initAnalytics()
    trackPageView(pathname)
  }, [pathname])

  return null
}
