import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getPageMeta, SITE_NAME } from '../../shared/config/seo'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!href) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// SPA ichida sahifa almashganda title, description, canonical, robots va OG teglarni yangilaydi.
// Birinchi yuklanishdagi qiymatlar build paytida statik HTML'ga yozilgan (scripts/prerender-seo.mjs).
export function SeoManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = getPageMeta(pathname)
    document.title = meta.title
    setMeta('name', 'description', meta.description)
    setMeta('name', 'robots', meta.index ? 'index, follow' : 'noindex, nofollow')
    setCanonical(meta.canonical)
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:site_name', SITE_NAME)
    if (meta.canonical) setMeta('property', 'og:url', meta.canonical)
    setMeta('name', 'twitter:title', meta.title)
    setMeta('name', 'twitter:description', meta.description)
  }, [pathname])

  return null
}
