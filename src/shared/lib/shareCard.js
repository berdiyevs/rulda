// Natija kartasi rasmi (1080x1080) va ulashish yordamchilari.
// Ranglar src/app/styles/variables.css dagi qorong'i tema qiymatlari bilan bir xil
// (rasm sayt mavzusidan qat'i nazar doim qorong'i chiqishi uchun shu yerda takrorlangan).
const COLORS = {
  bg: '#0a0c12',
  card: '#10131c',
  border: 'rgba(255, 255, 255, 0.14)',
  primary: '#6d5bff',
  accent: '#22d3ee',
  success: '#2dd4a7',
  successSoft: 'rgba(45, 212, 167, 0.14)',
  textPrimary: '#f5f6fa',
  textSecondary: '#a6adc0',
  textMuted: '#656d80',
}

const SIZE = 1080
const FONT = "Manrope, Inter, 'Segoe UI', system-ui, sans-serif"
export const SITE_URL = 'https://rulda.page'
export const SITE_HOST = 'rulda.page'

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

// Natija turiga qarab sarlavha va ulashish matnidagi ibora.
export function describeResult(result) {
  const ticketMatch = /^ticket-(\d+)$/.exec(result.topic || '')
  if (ticketMatch) return { label: `Bilet ${ticketMatch[1]}`, phrase: `Bilet ${ticketMatch[1]} ni` }
  if (result.isMini) return { label: 'Mini-test', phrase: 'mini-testni' }
  if (result.mode === 'review') return { label: 'Takrorlash', phrase: 'takrorlashni' }
  if (result.mode === 'exam') return { label: 'Imtihon', phrase: 'imtihonni' }
  if (result.mode === 'mistakes') return { label: 'Xatolar ustida ishlash', phrase: 'xatolar ustida ishlashni' }
  return { label: "Mashg'ulot", phrase: "mashg'ulotni" }
}

export function buildShareText(result) {
  const { phrase } = describeResult(result)
  const score = `${result.correctCount}/${result.totalQuestions}`
  return `Men Rulda'da ${phrase} ${score} bilan yechdim! Sen ham sinab ko'r:`
}

// Ismi yoki emaili yo'q, faqat natija: Rulda logotipi, "Bilet 7", "18/20", sana va sayt manzili.
export async function createShareImage(result) {
  try {
    await document.fonts?.ready
  } catch {
    // shrift yuklanmasa, zaxira shriftdan foydalaniladi
  }

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  const { label } = describeResult(result)
  const score = `${result.correctCount}/${result.totalQuestions}`

  // Fon: qorong'i, tepada brend nurlari (gradient-surface kabi)
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, SIZE, SIZE)
  const glowA = ctx.createRadialGradient(216, -108, 0, 216, -108, 620)
  glowA.addColorStop(0, 'rgba(109, 91, 255, 0.35)')
  glowA.addColorStop(1, 'rgba(109, 91, 255, 0)')
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, SIZE, SIZE)
  const glowB = ctx.createRadialGradient(SIZE, 0, 0, SIZE, 0, 520)
  glowB.addColorStop(0, 'rgba(34, 211, 238, 0.25)')
  glowB.addColorStop(1, 'rgba(34, 211, 238, 0)')
  ctx.fillStyle = glowB
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Karta
  roundedRect(ctx, 80, 80, SIZE - 160, SIZE - 160, 56)
  ctx.fillStyle = COLORS.card
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = COLORS.border
  ctx.stroke()

  // Logotip: "Rul" gradient, "da" oq
  ctx.textBaseline = 'alphabetic'
  ctx.font = `800 96px ${FONT}`
  const rulWidth = ctx.measureText('Rul').width
  const daWidth = ctx.measureText('da').width
  const logoX = (SIZE - (rulWidth + daWidth)) / 2
  const logoGradient = ctx.createLinearGradient(logoX, 0, logoX + rulWidth, 0)
  logoGradient.addColorStop(0, COLORS.primary)
  logoGradient.addColorStop(1, COLORS.accent)
  ctx.textAlign = 'left'
  ctx.fillStyle = logoGradient
  ctx.fillText('Rul', logoX, 250)
  ctx.fillStyle = COLORS.textPrimary
  ctx.fillText('da', logoX + rulWidth, 250)

  ctx.textAlign = 'center'

  // Sarlavha (masalan, "Bilet 7")
  ctx.fillStyle = COLORS.textSecondary
  ctx.font = `700 76px ${FONT}`
  ctx.fillText(label, SIZE / 2, 440)

  // Katta natija
  const scoreGradient = ctx.createLinearGradient(240, 0, 840, 0)
  scoreGradient.addColorStop(0, COLORS.primary)
  scoreGradient.addColorStop(1, COLORS.accent)
  ctx.fillStyle = scoreGradient
  ctx.font = `800 260px ${FONT}`
  ctx.fillText(score, SIZE / 2, 700)

  // Holat: o'tilgan bo'lsa yashil belgi bilan
  if (result.passed) {
    const pillW = 340
    const pillH = 96
    const pillX = (SIZE - pillW) / 2
    const pillY = 750
    roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2)
    ctx.fillStyle = COLORS.successSoft
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = COLORS.success
    ctx.stroke()

    // Belgi shriftga bog'liq bo'lmasligi uchun chiziq bilan chiziladi
    ctx.strokeStyle = COLORS.success
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(pillX + 50, pillY + 50)
    ctx.lineTo(pillX + 68, pillY + 68)
    ctx.lineTo(pillX + 98, pillY + 30)
    ctx.stroke()

    ctx.fillStyle = COLORS.success
    ctx.font = `800 46px ${FONT}`
    ctx.textAlign = 'left'
    ctx.fillText("O'tildi", pillX + 130, pillY + 63)
    ctx.textAlign = 'center'
  }

  // Pastki qator: sana va sayt manzili
  ctx.font = `600 40px ${FONT}`
  ctx.fillStyle = COLORS.textMuted
  ctx.textAlign = 'left'
  ctx.fillText(formatDate(new Date()), 150, 940)
  ctx.textAlign = 'right'
  ctx.fillStyle = COLORS.textSecondary
  ctx.fillText(SITE_HOST, SIZE - 150, 940)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Rasm yaratib bo\'lmadi'))), 'image/png')
  })
}

// Web Share API orqali rasm va matn ulashadi. 'shared' | 'cancelled' | 'unsupported' qaytaradi.
export async function shareImageNatively(blob, text) {
  const file = new File([blob], 'rulda-natija.png', { type: 'image/png' })
  if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [file] })) return 'unsupported'
  try {
    await navigator.share({ files: [file], text: `${text} ${SITE_URL}` })
    return 'shared'
  } catch (error) {
    return error?.name === 'AbortError' ? 'cancelled' : 'unsupported'
  }
}

export function downloadImage(blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rulda-natija.png'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function telegramShareUrl(text) {
  return `https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(text)}`
}
