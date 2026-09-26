// Landing sahifasidagi savol-javoblar. Oddiy JS: build paytida FAQPage JSON-LD uchun ham o'qiladi
// (scripts/prerender-seo.mjs), shuning uchun bu yerda React importlari bo'lmasin.
export const FAQS = [
  {
    question: 'Savollar bazasi rasmiymi?',
    answer:
      "Ha, saytdagi 1240 ta savol O'zbekiston DAN (Davlat Avtomobil Nazorati) rasmiy test bazasiga asoslangan va 2026-yilgi o'zgarishlarga moslab yangilangan.",
  },
  {
    question: 'Imtihon rejimi qanday ishlaydi?',
    answer:
      "Rasmiy imtihon rejimida (Premium) 20 ta tasodifiy savol, 25 daqiqa vaqt beriladi. 2 tadan ortiq xato qilinsa (ya'ni 3-xatoda), real imtihondagi kabi test darhol tugaydi. Kengaytirilgan mashg'ulot rejimida esa savollar sonini, vaqt chegarasini (vaqtsiz ham bo'ladi) va ruxsat etilgan xatolar sonini (cheklanmagan ham bo'ladi) o'zingiz tanlaysiz.",
  },
  {
    question: 'Foydalanish bepulmi?',
    answer: "Qisman. Bepul: 1–3-biletlar, kengaytirilgan rejimda mavzular bo'yicha mashq, yo'l belgilari to'plami va statistika. Premium: 4–62-biletlar, qat'iy rejim, rasmiy imtihon rejimi va xatolar ustida ishlash.",
  },
  {
    question: "Natijalarim saqlanadimi?",
    answer:
      "Ha, ro'yxatdan o'tgan har bir foydalanuvchining urinishlari profiliga saqlanadi va har bir mavzu bo'yicha eng so'nggi natijani mavzular sahifasida ko'rish mumkin.",
  },
  {
    question: "Telefon yoki planshetda ishlaydimi?",
    answer:
      "Ha, sayt barcha qurilmalarga (telefon, planshet, kompyuter) moslashgan va brauzer orqali qo'shimcha ilova o'rnatmasdan ishlatilaveradi.",
  },
  {
    question: "Ro'yxatdan o'tish shartmi?",
    answer:
      "Shart emas: mini-test, Bilet 1 va yo'l belgilari ro'yxatdan o'tmasdan ham ochiq. Bepul ro'yxatdan o'tsangiz, 1–3-biletlar, mavzular bo'yicha mashq va statistika ochiladi, natijalaringiz hisobingizda saqlanadi. Buning uchun Google hisobingiz yoki email va parol yetarli (email orqali bo'lsa, emailni tasdiqlash kerak). Mehmon sifatida yechgan natijalaringiz ro'yxatdan o'tgach hisobingizga ko'chiriladi.",
  },
]
