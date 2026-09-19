// One-off brand asset generator: rasterizes the steering-wheel mark into PNG
// icons (for manifest.json / apple-touch-icon) and renders the Open Graph
// share image used in index.html's og:image / twitter:image meta tags.
// Run manually whenever brand colors or copy change: node scripts/generate-brand-assets.mjs
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const PUBLIC = path.join(ROOT, 'public')

const BRAND_FROM = '#6d5bff'
const BRAND_TO = '#22d3ee'

// Square (unrounded) version of the mark — source for raster icons. Mobile
// OSes apply their own corner mask, so a pre-rounded source would double-round.
function markSvg(size) {
  const s = size
  const r = s * 0.3125 // wheel rim radius
  const hub = s * 0.1015625
  const cx = s / 2
  const cy = s / 2
  const strokeW = s * 0.0703125
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BRAND_FROM}"/>
      <stop offset="100%" stop-color="${BRAND_TO}"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="#0a0c12"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#g)" stroke-width="${strokeW}"/>
  <circle cx="${cx}" cy="${cy}" r="${hub}" fill="url(#g)"/>
  <path d="M${cx} ${cy - r * 0.65} V${cy - r * 0.15}
           M${cx - r * 0.83} ${cy + r * 0.55} L${cx - r * 0.36} ${cy + r * 0.15}
           M${cx + r * 0.83} ${cy + r * 0.55} L${cx + r * 0.36} ${cy + r * 0.15}"
        stroke="url(#g)" stroke-width="${strokeW}" stroke-linecap="round"/>
</svg>`
}

function ogImageSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0c12"/>
      <stop offset="100%" stop-color="#10131c"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BRAND_FROM}"/>
      <stop offset="100%" stop-color="${BRAND_TO}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="12%" cy="8%" r="55%">
      <stop offset="0%" stop-color="${BRAND_FROM}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${BRAND_FROM}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="92%" cy="0%" r="55%">
      <stop offset="0%" stop-color="${BRAND_TO}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${BRAND_TO}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <g transform="translate(90,86)">
    <circle cx="42" cy="42" r="35" fill="none" stroke="url(#brand)" stroke-width="7.5"/>
    <circle cx="42" cy="42" r="11" fill="url(#brand)"/>
    <path d="M42 14 V31 M14.5 58 L30 48.5 M69.5 58 L54 48.5" stroke="url(#brand)" stroke-width="7.5" stroke-linecap="round"/>
  </g>

  <text x="90" y="308" font-family="Arial, Helvetica, sans-serif" font-size="112" font-weight="800" fill="#f5f6fa">
    <tspan fill="#9483ff">Rul</tspan>da
  </text>

  <text x="94" y="368" font-family="Arial, Helvetica, sans-serif" font-size="33" font-weight="600" fill="#a6adc0">
    Haydovchilik guvohnomasini birinchi urinishda oling
  </text>

  <g font-family="Arial, Helvetica, sans-serif">
    <text x="94" y="470" font-size="46" font-weight="800" fill="#f5f6fa">1240+</text>
    <text x="94" y="503" font-size="21" fill="#7d8499">Rasmiy savollar</text>

    <text x="340" y="470" font-size="46" font-weight="800" fill="#f5f6fa">93</text>
    <text x="340" y="503" font-size="21" fill="#7d8499">Yo'l belgilari</text>

    <text x="500" y="470" font-size="46" font-weight="800" fill="#f5f6fa">24/7</text>
    <text x="500" y="503" font-size="21" fill="#7d8499">Bepul mashq</text>
  </g>
</svg>`
}

async function main() {
  const icon192 = Buffer.from(markSvg(192))
  const icon512 = Buffer.from(markSvg(512))
  const iconApple = Buffer.from(markSvg(180))
  const og = Buffer.from(ogImageSvg())

  await sharp(icon192).png().toFile(path.join(PUBLIC, 'icon-192.png'))
  await sharp(icon512).png().toFile(path.join(PUBLIC, 'icon-512.png'))
  await sharp(iconApple).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'))
  await sharp(og).png().toFile(path.join(PUBLIC, 'og-image.png'))

  console.log('Generated: icon-192.png, icon-512.png, apple-touch-icon.png, og-image.png')
}

main()
