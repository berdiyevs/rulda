// 15000 -> "15 000 so'm" (brauzer tiliga bog'liq bo'lmagan, uzilmaydigan probel bilan)
export function formatPrice(amount) {
  const grouped = String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${grouped} so'm`
}
