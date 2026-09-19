import { apiFetch } from '../../../shared/api/client'

export async function fetchPlans() {
  return apiFetch('/payments/plans', { auth: false })
}

export async function createClickPayment(plan) {
  return apiFetch('/payments/click/create', { method: 'POST', body: { plan } })
}
