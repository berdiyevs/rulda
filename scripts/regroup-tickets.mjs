// Re-chunks the already-imported question bank into 62 tickets of exactly
// 20 questions each (instead of the source site's 124 x ~10 grouping).
// The last chunk, which naturally falls short, is padded by duplicating
// questions from the front of the pool so every ticket has exactly 20.
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const TICKET_SIZE = 20
const ROOT = path.resolve(import.meta.dirname, '..')
const QUESTIONS_PATH = path.join(ROOT, 'public/data/questions.json')

async function main() {
  const questions = JSON.parse(await readFile(QUESTIONS_PATH, 'utf-8'))

  const flat = questions.map(({ ticketId, ...rest }) => rest)
  const ticketCount = Math.ceil(flat.length / TICKET_SIZE)

  const regrouped = []
  for (let t = 0; t < ticketCount; t++) {
    const chunk = flat.slice(t * TICKET_SIZE, (t + 1) * TICKET_SIZE)

    let padIndex = 0
    while (chunk.length < TICKET_SIZE) {
      chunk.push(flat[padIndex])
      padIndex++
    }

    for (const q of chunk) regrouped.push({ ...q, ticketId: t + 1 })
  }

  await writeFile(QUESTIONS_PATH, JSON.stringify(regrouped, null, 2))

  const sizes = new Map()
  for (const q of regrouped) sizes.set(q.ticketId, (sizes.get(q.ticketId) || 0) + 1)

  console.log(`Tickets: ${sizes.size}`)
  console.log(`All exactly ${TICKET_SIZE}: ${[...sizes.values()].every((n) => n === TICKET_SIZE)}`)
  console.log(`Total question entries: ${regrouped.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
