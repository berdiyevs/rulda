import { apiFetch } from '../../../shared/api/client'

// "1.2" < "1.10" < "1.11.1": raqam bo'laklari bo'yicha solishtiriladi (matn bo'yicha emas).
function compareSignIds(a, b) {
  const partsA = String(a).split('.').map(Number)
  const partsB = String(b).split('.').map(Number)
  const length = Math.max(partsA.length, partsB.length)
  for (let i = 0; i < length; i += 1) {
    const diff = (partsA[i] ?? -1) - (partsB[i] ?? -1)
    if (diff !== 0 && !Number.isNaN(diff)) return diff
  }
  return String(a).localeCompare(String(b))
}

export async function fetchRoadSigns() {
  const signs = await apiFetch('/road-signs', { auth: false })
  return [...signs].sort((a, b) => compareSignIds(a.id, b.id))
}

export const SIGN_CATEGORIES = [
  { key: 'ogohlantiruvchi', nom: 'Ogohlantiruvchi belgilar' },
  { key: 'imtiyozli', nom: 'Imtiyozli belgilar' },
  { key: 'taqiqlovchi', nom: 'Taqiqlovchi belgilar' },
  { key: 'buyuruvchi', nom: 'Buyuruvchi belgilar' },
]
