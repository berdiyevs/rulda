import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Text } from '@mantine/core'
import { Button } from '../../../shared/ui/Button/Button'
import { ROUTES } from '../../../shared/config/routes'
import './CookieBanner.css'

const STORAGE_KEY = 'rulda_cookie_notice'

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// Birinchi kirishda pastda ixcham xabarnoma. "Tushunarli" bosilgach qayta chiqmaydi.
export function CookieBanner() {
  const { pathname } = useLocation()
  const [dismissed, setDismissed] = useState(wasDismissed)

  // Test paytida javob tugmalarini to'smaslik uchun test sahifasida ko'rsatilmaydi.
  if (dismissed || pathname === ROUTES.QUIZ) return null

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // localStorage yopiq bo'lsa, banner shu sessiya davomida yashiriladi.
    }
    setDismissed(true)
  }

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie xabarnomasi">
      <Text fz="xs" lh={1.45} style={{ flex: 1 }}>
        Sayt tahlil uchun cookie fayllardan foydalanadi.{' '}
        <Link to={ROUTES.PRIVACY} className="cookie-banner-link">
          Batafsil
        </Link>
      </Text>
      <Button variant="secondary" size="xs" onClick={handleDismiss}>
        Tushunarli
      </Button>
    </div>
  )
}
