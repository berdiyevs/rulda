import { apiFetch } from '../../../shared/api/client'

export async function fetchRoadSigns() {
  return apiFetch('/road-signs', { auth: false })
}

export const SIGN_CATEGORIES = [
  { key: 'ogohlantiruvchi', nom: 'Ogohlantiruvchi belgilar' },
  { key: 'imtiyozli', nom: 'Imtiyozli belgilar' },
  { key: 'taqiqlovchi', nom: 'Taqiqlovchi belgilar' },
  { key: 'buyuruvchi', nom: 'Buyuruvchi belgilar' },
]
