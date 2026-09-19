import { apiFetch } from '../../../shared/api/client'

function fromApiUser(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.display_name,
    isVerified: u.is_verified,
    isAdmin: u.is_admin,
    isPremium: u.is_premium,
    isPremiumActive: u.is_premium_active,
    premiumUntil: u.premium_until,
    examDate: u.exam_date,
    createdAt: u.created_at ? new Date(u.created_at) : null,
    lastLogin: u.last_login ? new Date(u.last_login) : null,
    attemptCount: u.attempt_count,
  }
}

export async function fetchAdminUsers() {
  const data = await apiFetch('/admin/users')
  return data.map(fromApiUser)
}

export async function updateAdminUser(userId, patch) {
  const body = {}
  if ('isVerified' in patch) body.is_verified = patch.isVerified
  if ('isAdmin' in patch) body.is_admin = patch.isAdmin
  if ('isPremium' in patch) body.is_premium = patch.isPremium
  if ('premiumUntil' in patch) body.premium_until = patch.premiumUntil
  const data = await apiFetch(`/admin/users/${userId}`, { method: 'PATCH', body })
  return fromApiUser(data)
}

export async function deleteAdminUser(userId) {
  await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' })
}

export async function fetchAdminStats() {
  return apiFetch('/admin/stats')
}

export async function createQuestion(payload) {
  return apiFetch('/admin/questions', { method: 'POST', body: payload })
}

export async function updateQuestion(pk, payload) {
  return apiFetch(`/admin/questions/${pk}`, { method: 'PATCH', body: payload })
}

export async function deleteQuestion(pk) {
  await apiFetch(`/admin/questions/${pk}`, { method: 'DELETE' })
}

export async function createRoadSign(payload) {
  return apiFetch('/admin/road-signs', { method: 'POST', body: payload })
}

export async function updateRoadSign(id, payload) {
  return apiFetch(`/admin/road-signs/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload })
}

export async function deleteRoadSign(id) {
  await apiFetch(`/admin/road-signs/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function fetchAdminPlans() {
  return apiFetch('/admin/plans')
}

export async function updateAdminPlan(planId, payload) {
  return apiFetch(`/admin/plans/${encodeURIComponent(planId)}`, { method: 'PATCH', body: payload })
}
