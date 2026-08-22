// One-off data import: pulls the official-style question bank + "Bilet" (ticket)
// grouping from yhq-test.uz's public JSON API and rewrites public/data/questions.json
// and public/assets/quest-image/ to match. Run manually: node scripts/import-yhq-questions.mjs
import { mkdir, rm, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SOURCE = 'https://yhq-test.uz'
const PAGE_SIZE = 100
const CONCURRENCY = 3
const REQUEST_DELAY_MS = 150

const ROOT = path.resolve(import.meta.dirname, '..')
const QUESTIONS_OUT = path.join(ROOT, 'public/data/questions.json')
const IMAGES_OUT_DIR = path.join(ROOT, 'public/assets/quest-image')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

async function fetchAllQuestions() {
  const first = await fetchJson(`${SOURCE}/api/questions?page=1&pageSize=${PAGE_SIZE}`)
  const totalPages = first.totalPages
  const all = [...first.items]

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
  for (let i = 0; i < remainingPages.length; i += CONCURRENCY) {
    const batch = remainingPages.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map((page) => fetchJson(`${SOURCE}/api/questions?page=${page}&pageSize=${PAGE_SIZE}`)),
    )
    for (const r of results) all.push(...r.items)
    await sleep(REQUEST_DELAY_MS)
  }

  console.log(`Fetched ${all.length}/${first.total} questions across ${totalPages} pages`)
  return all
}

function toOurSchema(raw) {
  return {
    id: raw.id,
    question: raw.question,
    image_url: raw.hasImage && raw.image ? `/assets/quest-image/${raw.image}.webp` : '',
    ticketId: raw.categoryId,
    options: raw.answers.map((text, i) => ({
      id: i + 1,
      text,
      is_correct: i === raw.correctIndex,
    })),
  }
}

async function downloadAndConvertImages(rawQuestions) {
  await rm(IMAGES_OUT_DIR, { recursive: true, force: true })
  await mkdir(IMAGES_OUT_DIR, { recursive: true })

  const unique = new Map()
  for (const q of rawQuestions) {
    if (q.hasImage && q.image && q.imagePath) unique.set(q.image, q.imagePath)
  }

  const entries = [...unique.entries()]
  console.log(`Downloading + converting ${entries.length} images...`)

  let done = 0
  let failed = 0
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async ([imageId, imagePath]) => {
        try {
          const res = await fetch(`${SOURCE}${imagePath}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
          if (!res.ok) throw new Error(`${res.status}`)
          const buf = Buffer.from(await res.arrayBuffer())
          const webp = await sharp(buf).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
          await writeFile(path.join(IMAGES_OUT_DIR, `${imageId}.webp`), webp)
        } catch (err) {
          failed++
          console.warn(`  ! failed ${imageId}: ${err.message}`)
        }
      }),
    )
    done += batch.length
    if (done % 60 === 0 || done === entries.length) console.log(`  ${done}/${entries.length}`)
    await sleep(REQUEST_DELAY_MS)
  }

  console.log(`Images done. ${entries.length - failed} ok, ${failed} failed.`)
}

async function main() {
  const raw = await fetchAllQuestions()

  await downloadAndConvertImages(raw)

  const questions = raw.map(toOurSchema)
  await writeFile(QUESTIONS_OUT, JSON.stringify(questions, null, 2))

  const savedImages = (await readdir(IMAGES_OUT_DIR)).length
  const ticketCount = new Set(questions.map((q) => q.ticketId)).size

  console.log('\n--- Import summary ---')
  console.log(`Questions written: ${questions.length}`)
  console.log(`With image:        ${questions.filter((q) => q.image_url).length}`)
  console.log(`Images saved:      ${savedImages}`)
  console.log(`Tickets (bilet):   ${ticketCount}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
