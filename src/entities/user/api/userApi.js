import { apiFetch } from '../../../shared/api/client'

export async function updateExamDate(examDate) {
  return apiFetch('/users/me/exam-date', {
    method: 'PATCH',
    body: { exam_date: examDate },
  })
}
