// Sahifalar uchun SEO ma'lumotlari. Bitta manba: brauzerda (SeoManager) va build paytida
// statik HTML yaratishda (scripts/prerender-seo.mjs) ishlatiladi. Shuning uchun bu faylda
// faqat oddiy JS bo'lishi kerak (Vite yoki React importlari yo'q).

export const SITE_URL = 'https://rulda.page'
export const SITE_NAME = 'Rulda'
export const OG_IMAGE = `${SITE_URL}/og-image.png`

const DEFAULT_DESCRIPTION =
  "O'zbekiston yo'l harakati qoidalarini bepul o'rganing: 1240 ta rasmiy imtihon savoli, 62 ta bilet, 93 ta yo'l belgisi va shaxsiy progress kuzatuvi. Haydovchilik guvohnomasini birinchi urinishda oling."

// Qidiruv tizimida ko'rinadigan ochiq sahifalar.
export const PUBLIC_PAGES = {
  '/': {
    title: "Rulda — yo'l harakati qoidalari testlari va imtihon biletlari 2026",
    description: DEFAULT_DESCRIPTION,
    changefreq: 'weekly',
    priority: '1.0',
  },
  '/tickets': {
    title: "Imtihon biletlari 2026 — 62 ta bilet, 1240 ta savol | Rulda",
    description:
      "Haydovchilik imtihoni biletlarini onlayn yeching: 62 ta bilet, har birida 20 ta savol, 25 daqiqa va 2 ta xato — rasmiy imtihon formati. 1–3-biletlar bepul.",
    changefreq: 'weekly',
    priority: '0.9',
  },
  '/road-signs': {
    title: "Yo'l belgilari — rasmlari va nomlari bilan | Rulda",
    description:
      "O'zbekiston yo'l belgilari: ogohlantiruvchi, imtiyozli, taqiqlovchi va buyuruvchi belgilar rasmlari va nomlari bilan. Qidiruv va guruhlar bo'yicha ko'rib chiqing.",
    changefreq: 'monthly',
    priority: '0.8',
  },
  '/terms': {
    title: 'Foydalanish shartlari | Rulda',
    description: "Rulda platformasidan foydalanish shartlari.",
    changefreq: 'yearly',
    priority: '0.2',
  },
  '/privacy': {
    title: 'Maxfiylik siyosati | Rulda',
    description: "Rulda platformasi shaxsiy ma'lumotlarni qanday yig'ishi va himoya qilishi haqida.",
    changefreq: 'yearly',
    priority: '0.2',
  },
}

// Shaxsiy yoki texnik sahifalar: indekslanmaydi.
export const PRIVATE_PAGES = {
  '/categories': 'Asosiy sahifa | Rulda',
  '/statistics': 'Statistika | Rulda',
  '/premium': 'Premium | Rulda',
  '/quiz': 'Test | Rulda',
  '/verify-email': 'Emailni tasdiqlash | Rulda',
  '/admin': 'Admin panel | Rulda',
}

const NOT_FOUND = { title: 'Sahifa topilmadi | Rulda', description: DEFAULT_DESCRIPTION }

/**
 * Berilgan yo'l uchun meta ma'lumotlar.
 * @returns {{ title: string, description: string, canonical: string | null, index: boolean }}
 */
export function getPageMeta(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const page = PUBLIC_PAGES[path]
  if (page) {
    return {
      title: page.title,
      description: page.description,
      canonical: `${SITE_URL}${path === '/' ? '/' : path}`,
      index: true,
    }
  }
  const privateTitle = PRIVATE_PAGES[path]
  return {
    title: privateTitle || NOT_FOUND.title,
    description: DEFAULT_DESCRIPTION,
    canonical: null,
    index: false,
  }
}
