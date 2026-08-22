export async function fetchRoadSigns() {
  const response = await fetch('/data/road-signs.json')
  if (!response.ok) {
    throw new Error("Belgilarni yuklashda xatolik yuz berdi")
  }
  return response.json()
}

export const SIGN_CATEGORIES = [
  { key: 'ogohlantiruvchi', nom: 'Ogohlantiruvchi belgilar' },
  { key: 'imtiyozli', nom: 'Imtiyozli belgilar' },
  { key: 'taqiqlovchi', nom: 'Taqiqlovchi belgilar' },
  { key: 'buyuruvchi', nom: 'Buyuruvchi belgilar' },
]
