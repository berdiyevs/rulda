import { apiFetch } from '../../../shared/api/client'

export async function fetchQuestions() {
  return apiFetch('/questions', { auth: false })
}

export function filterQuestionsByTopic(questions, topic) {
  switch (topic) {
    case 'signs':
      return questions.filter((q) => Boolean(q.image_url))
    case 'theory':
      return questions.filter((q) => !q.image_url)
    case 'all':
    default:
      return questions
  }
}

// Bazada 1235 ta noyob savol bor; 62 x 20 = 1240 bo'lishi uchun 62-biletda 1-biletning 5 ta savoli
// takrorlanadi (bir xil ID). Bilet bo'yicha emas, butun baza bo'yicha ishlaganda (mashq, takrorlash,
// statistika) har bir savol bir marta olinishi kerak, aks holda u sessiyada ikki marta chiqadi.
export function uniqueQuestions(questions) {
  const seen = new Set()
  return questions.filter((q) => {
    if (seen.has(q.id)) return false
    seen.add(q.id)
    return true
  })
}
