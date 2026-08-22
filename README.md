# Rulda

O'zbekiston yo'l harakati qoidalarini o'rganish uchun interaktiv platforma. **React + Vite**, **Feature-Sliced Design (FSD)** arxitekturasi va **Firebase (Auth + Firestore)** asosida qurilgan.

## Ishga tushirish

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Nima yangilandi (2-versiya)

- **Butunlay yangi dizayn** — zamonaviy dark-glass uslub, gradient aksentlar, animatsiyalar
- **Auth majburiy** — Mavzular, Test va Yo'l belgilari sahifalari faqat ro'yxatdan o'tgan va email tasdiqlangan foydalanuvchilar uchun ochiq (`ProtectedRoute`)
- **Real test logikasi**:
  - Har safar 20 ta savol **tasodifiy** tanlanadi (avval doim bir xil 20 ta savol chiqar edi)
  - Javob variantlari ham aralashtiriladi
  - **Imtihon rejimi**: 20 daqiqalik ishlaydigan taymer, 2 tadan ortiq xato — yiqilish
  - **Mashg'ulot rejimi**: vaqt cheklovisiz, mavzu bo'yicha (barcha / yo'l belgilari / nazariy)
- **Natija ekrani** — test tugagach ball, to'g'ri/xato soni va "qayta urinish" tugmasi
- **Firestore'ga saqlash** — har bir urinish `users/{uid}/attempts` ichiga yoziladi, Mavzular sahifasida oxirgi urinish natijasi ko'rsatiladi
- **Yo'l belgilari** sahifasida qidiruv va kategoriya bo'yicha filtr

## Arxitektura (FSD)

```
src/
  app/          — router, providerlar, global CSS (design tokens, reset, global)
  pages/        — landing, categories, quiz (intro/play/results), road-signs, not-found
  widgets/      — navbar, login-modal, sidebar (top nav), quiz-sidebar, quiz-results, footer
  features/     — auth (login/signup/google), quiz-engine (test logikasi, taymer, saqlash)
  entities/     — user (Firestore profil), question, quiz-attempt, road-sign, category (topics)
  shared/       — Firebase config, route'lar, UI kit (Button, Modal, Badge, Spinner...), lib (shuffle, countdown)
```

## Firebase sozlamalari

Loyiha allaqachon Firebase konfiguratsiyasi bilan keladi (`src/shared/api/firebase.js`). Ishlashi uchun **Firestore Console**'da quyidagi qoidalarni o'rnating (foydalanuvchi faqat o'z ma'lumotlarini o'qiy/yoza olishi uchun):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /attempts/{attemptId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Ma'lumotlar

- `public/data/questions.json` — 600 ta test savoli (356 tasi rasm bilan)
- `public/data/road-signs.json` — 93 ta yo'l belgisi (4 kategoriya)
- `public/assets/` — savol va belgilarga tegishli rasmlar (alohida arxivda yetkaziladi, hajmi katta)
