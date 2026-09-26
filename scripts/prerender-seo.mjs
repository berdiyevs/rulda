// Build'dan keyin ishlaydi: har bir ochiq sahifa uchun alohida statik HTML yaratadi.
//
// Nega kerak: sayt SPA, shuning uchun qidiruv tizimlari (ayniqsa Yandex) va Telegram/Facebook
// havola ko'rinishi har sahifada bir xil index.html ni ko'rardi. Endi har sahifaning o'z
// title, description, canonical, OG teglari, JSON-LD va asosiy matni HTML'ning o'zida bor.
// React yuklangach, #root ichidagi statik matn odatdagi sahifa bilan almashtiriladi.
//
// Natija: dist/index.html, dist/tickets.html, dist/road-signs.html, ... va dist/sitemap.xml.
// Netlify "/tickets" so'roviga "tickets.html" faylini beradi (fayl _redirects qoidasidan ustun).

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PUBLIC_PAGES, SITE_URL, SITE_NAME, OG_IMAGE, getPageMeta } from '../src/shared/config/seo.js'
import { FAQS } from '../src/pages/landing/model/faq.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// JSON-LD ichida "</script>" chiqib qolmasligi uchun.
const jsonLd = (data) =>
  `    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

const SIGN_GROUPS = [
  { key: 'ogohlantiruvchi', nom: 'Ogohlantiruvchi belgilar' },
  { key: 'imtiyozli', nom: 'Imtiyozli belgilar' },
  { key: 'taqiqlovchi', nom: 'Taqiqlovchi belgilar' },
  { key: 'buyuruvchi', nom: 'Buyuruvchi belgilar' },
]

function compareSignIds(a, b) {
  const pa = String(a).split('.').map(Number)
  const pb = String(b).split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] ?? -1) - (pb[i] ?? -1)
    if (diff !== 0 && !Number.isNaN(diff)) return diff
  }
  return 0
}

function breadcrumb(name, pathname) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bosh sahifa', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}${pathname}` },
    ],
  }
}

const NAV_LINKS = `
      <nav aria-label="Bo'limlar">
        <a href="/">Bosh sahifa</a> ·
        <a href="/tickets">Imtihon biletlari</a> ·
        <a href="/road-signs">Yo'l belgilari</a>
      </nav>`

function staticSection(inner) {
  return `
    <div class="seo-static">${NAV_LINKS}
${inner}
    </div>`
}

function buildPages(signs) {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
  }

  return {
    '/': {
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: `${SITE_URL}/`,
          inLanguage: 'uz',
          description: PUBLIC_PAGES['/'].description,
        },
        organization,
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        },
      ],
      content: staticSection(`
      <h1>Haydovchilik guvohnomasini birinchi urinishda oling</h1>
      <p>O'zbekiston yo'l harakati qoidalarini interaktiv testlar orqali o'rganing: 1240 ta imtihon savoli,
      62 ta bilet (har birida 20 ta savol), 93 ta yo'l belgisi va shaxsiy progress kuzatuvi.</p>
      <h2>Ko'p so'raladigan savollar</h2>
${FAQS.map((f) => `      <h3>${escapeHtml(f.question)}</h3>\n      <p>${escapeHtml(f.answer)}</p>`).join('\n')}`),
    },
    '/tickets': {
      jsonLd: [breadcrumb('Imtihon biletlari', '/tickets')],
      content: staticSection(`
      <h1>Imtihon biletlari</h1>
      <p>Rasmiy imtihon formatidagi 62 ta bilet — har birida aynan 20 ta savol. Har bir bilet uchun 25 daqiqa
      vaqt beriladi va 2 tagacha xatoga ruxsat bor. 1-bilet ro'yxatdan o'tmasdan, 1–3-biletlar bepul hisob
      bilan, qolganlari Premium bilan ochiladi.</p>`),
    },
    '/road-signs': {
      jsonLd: [
        breadcrumb("Yo'l belgilari", '/road-signs'),
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: "O'zbekiston yo'l belgilari",
          numberOfItems: signs.length,
          itemListElement: signs.map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: s.nom,
            image: `${SITE_URL}${s.rasm}`,
          })),
        },
      ],
      content: staticSection(`
      <h1>Yo'l belgilari to'plami</h1>
      <p>${SIGN_GROUPS.length} ta guruhdagi ${signs.length} ta yo'l belgisi rasmlari va nomlari bilan.</p>
${SIGN_GROUPS.map((g) => {
  const items = signs.filter((s) => s.kategoriya === g.key)
  if (items.length === 0) return ''
  return `      <h2>${escapeHtml(g.nom)}</h2>\n      <ul>\n${items
    .map((s) => `        <li><img src="${escapeHtml(s.rasm)}" alt="${escapeHtml(s.nom)}" width="48" height="48" loading="lazy" /> ${escapeHtml(s.nom)}</li>`)
    .join('\n')}\n      </ul>`
})
  .filter(Boolean)
  .join('\n')}`),
    },
    '/terms': { jsonLd: [], content: staticSection('\n      <h1>Foydalanish shartlari</h1>') },
    '/privacy': { jsonLd: [], content: staticSection('\n      <h1>Maxfiylik siyosati</h1>') },
  }
}

function setTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`prerender-seo: index.html ichida ${label} topilmadi`)
  return html.replace(pattern, replacement)
}

function renderPage(template, pathname, page) {
  const meta = getPageMeta(pathname)
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  let html = template
  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, '<title>')
  html = setTag(html, /<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${description}" />`, 'description')
  html = setTag(html, /<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${meta.canonical}" />`, 'canonical')
  html = setTag(html, /<meta property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${title}" />`, 'og:title')
  html = setTag(html, /<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${description}" />`, 'og:description')
  html = setTag(html, /<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${meta.canonical}" />`, 'og:url')
  html = setTag(html, /<meta property="og:image" [^>]*\/>/, `<meta property="og:image" content="${OG_IMAGE}" />`, 'og:image')
  html = setTag(html, /<meta name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${title}" />`, 'twitter:title')
  html = setTag(html, /<meta\s+name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${description}" />`, 'twitter:description')
  html = setTag(
    html,
    /<!--seo:jsonld-->[\s\S]*?<!--\/seo:jsonld-->/,
    page.jsonLd.map(jsonLd).join('\n'),
    'seo:jsonld',
  )
  html = setTag(html, /<!--seo:content-->/, page.content, 'seo:content')
  return html
}

function buildSitemap(lastmod) {
  const urls = Object.entries(PUBLIC_PAGES)
    .map(
      ([pathname, page]) => `  <url>
    <loc>${SITE_URL}${pathname}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

async function main() {
  const template = await readFile(path.join(dist, 'index.html'), 'utf8')
  const signs = JSON.parse(await readFile(path.join(root, 'public/data/road-signs.json'), 'utf8')).sort((a, b) =>
    compareSignIds(a.id, b.id),
  )
  const pages = buildPages(signs)

  for (const pathname of Object.keys(PUBLIC_PAGES)) {
    const page = pages[pathname]
    if (!page) throw new Error(`prerender-seo: ${pathname} uchun sahifa tavsifi yo'q`)
    const file = pathname === '/' ? 'index.html' : `${pathname.slice(1)}.html`
    await writeFile(path.join(dist, file), renderPage(template, pathname, page))
  }

  // Shaxsiy sahifalar va 404 uchun: kontent va JSON-LD'siz, indekslanmaydigan shablon.
  // _redirects SPA qoidasi shu faylga yo'naltiradi, shuning uchun ular bosh sahifa nusxasi bo'lib indekslanmaydi.
  let appShell = template
    .replace(/<!--seo:jsonld-->[\s\S]*?<!--\/seo:jsonld-->/, '')
    .replace('<!--seo:content-->', '')
    .replace(/<meta name="robots"[^>]*\/>/, '<meta name="robots" content="noindex, nofollow" />')
    .replace(/<link rel="canonical"[^>]*\/>\s*/, '')
  await writeFile(path.join(dist, 'app.html'), appShell)

  const lastmod = new Date().toISOString().slice(0, 10)
  await writeFile(path.join(dist, 'sitemap.xml'), buildSitemap(lastmod))

  console.log(`prerender-seo: ${Object.keys(PUBLIC_PAGES).length} ta sahifa, app.html va sitemap.xml yaratildi`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
