# Rulda

O'zbekiston yo'l harakati qoidalarini o'rganish va DAN (Davlat Avtomobil Nazorati) imtihoniga tayyorgarlik ko'rish uchun interaktiv platforma. **React + Vite** frontend (**Feature-Sliced Design**) va **FastAPI + PostgreSQL** backend asosida qurilgan.

## Ishga tushirish

### 1. Backend (FastAPI + PostgreSQL)

```bash
docker compose up --build
```

Bu `db` (PostgreSQL) va `api` (FastAPI, `http://localhost:8000`) konteynerlarini ishga tushiradi va migratsiyalarni avtomatik qo'llaydi. Google login uchun `backend/.env` faylida `GOOGLE_CLIENT_ID` ni to'ldiring (frontenddagi `VITE_GOOGLE_CLIENT_ID` bilan bir xil bo'lishi shart emas, backend uni hozircha tekshirmaydi — token to'g'ridan-to'g'ri Google'ning `userinfo` endpointi orqali tasdiqlanadi).

Docker'siz ishga tushirish uchun:

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate   # Windows
pip install -r requirements.txt
cp .env.example .env      # qiymatlarni to'ldiring, DATABASE_URL lokal Postgres'ga ishora qilsin
alembic upgrade head
uvicorn app.main:app --reload
```

### 2. Frontend

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

`.env` fayli kerak bo'ladi (`.env.example`ga qarang):

```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=<Google Cloud Console'dan olingan OAuth Web Client ID>
```

Email tasdiqlash hozircha soddalashtirilgan rejimda ishlaydi (`SIMPLE_EMAIL_MODE=true`): real email yuborilmaydi, tasdiqlash havolasi ro'yxatdan o'tish javobida (va backend loglarida) qaytariladi. Productionga chiqishdan oldin `backend/app/api/auth.py`dagi `signup` funksiyasiga real SMTP/email xizmati ulanishi kerak.

## Xususiyatlar

- **Auth** — email/parol yoki Google orqali kirish/ro'yxatdan o'tish, email tasdiqlash majburiy. Mavzular, Test, Biletlar, Yo'l belgilari va Statistika sahifalari faqat tasdiqlangan foydalanuvchilar uchun ochiq (`ProtectedRoute`).
- **Test rejimlari** (mavzu bo'yicha mashg'ulot boshlanganda tanlanadi):
  - **Qat'iy rejim** — 20 savol, 25 daqiqa, 2 tadan ortiq xatoda test darhol tugaydi (real imtihon qoidalari, lekin tanlangan mavzu doirasida).
  - **Kengaytirilgan rejim** — savollar soni (10/20/30/50/100), vaqt chegarasi (vaqtsiz/15/30/45/60 daq), ruxsat etilgan xatolar soni (cheklanmagan/0/2/5) va javobni ko'rsatish tartibi (darhol / faqat oxirida) — barchasi erkin sozlanadi.
- **Rasmiy imtihon** — alohida kirish nuqtasi (navbardagi "Imtihon" tugmasi): 20 ta tasodifiy savol, 25 daqiqa, 2 tadan ortiq xatoda yiqilish, to'liq ekran rejimida boshlanadi.
- **Biletlar** — 62 ta rasmiy bilet, har biri aynan 20 ta belgilangan savoldan iborat, 25 daqiqalik majburiy taymer bilan; xatolar soni va javob ko'rsatish tartibi shu yerda ham sozlanadi.
- **Xatolarim** — statistika sahifasidan avvalgi urinishlarda xato qilingan savollar bo'yicha maxsus mashq sessiyasi ochiladi.
- **Yo'l belgilari** — 93 ta rasmiy belgi, qidiruv va kategoriya bo'yicha filtr.
- **Statistika** — imtihonga tayyorgarlik foizi, mavzular bo'yicha natija, urinishlar dinamikasi grafigi, xatolar ro'yxati.
- **Mobil ilova tajribasi** — kichik ekranlarda pastki tab-bar navigatsiya (Asosiy / Biletlar / Belgilar / Imtihon / Statistika), test ekranida scroll'siz, to'liq balandlikka moslashgan layout.
- **Foydalanish shartlari va Maxfiylik siyosati** sahifalari, ro'yxatdan o'tish formasida ularga rozilik matni.
- **SEO** — meta teglar, Open Graph/Twitter card rasm, `robots.txt`, `sitemap.xml`, `manifest.json` (PWA-lite), FAQPage/WebSite structured data (`index.html`).

## Arxitektura (FSD)

```
src/
  app/          — router, providerlar, global CSS (design tokens, reset, global)
  pages/        — landing, categories, quiz (intro/play/results), tickets, road-signs,
                  statistics, terms, privacy, verify-email, not-found
  widgets/      — navbar (landing), sidebar (ilova ichidagi top-nav + mobil tab-bar),
                  login-modal, quiz-start (rejim tanlash modali), quiz-sidebar
                  (progress paneli + in-quiz nav), quiz-results, footer
  features/     — auth (login/signup/google), quiz-engine (test logikasi, taymer,
                  xatolar chegarasi, javob ko'rsatish rejimi, saqlash),
                  statistics (streak, umumiy hisobotlar)
  entities/     — user (backend profil), question, quiz-attempt, road-sign,
                  category (mavzular), ticket
  shared/       — API klient (`api/client.js`, JWT bilan fetch wrapper),
                  Google OAuth yuklovchi (`api/googleAuth.js`), route'lar,
                  UI kit (Button, Modal, Badge, Spinner...), lib (shuffle, countdown, fullscreen)
```

## Backend arxitekturasi

```
backend/
  app/
    core/       — sozlamalar (config.py), JWT/parol xavfsizligi (security.py)
    db/         — SQLAlchemy modellari (User, QuizAttempt), session
    schemas/    — Pydantic so'rov/javob sxemalari
    api/        — auth (signup/login/google/verify-email/me), users (imtihon sanasi),
                  attempts (test urinishlari)
  alembic/      — DB migratsiyalari
```

Autentifikatsiya JWT (Bearer token) orqali, frontend tokenni `localStorage`da saqlaydi va har so'rovda `Authorization` headerida yuboradi (`src/shared/api/client.js`). Google bilan kirish uchun frontend Google Identity Services orqali `access_token` oladi (`src/shared/api/googleAuth.js`), backend esa uni Google'ning `userinfo` endpointi bilan tekshiradi.

## Ma'lumotlar

- `public/data/questions.json` — 1240 ta test savoli (722 tasi rasm bilan), 62 ta biletga guruhlangan
- `public/data/road-signs.json` — 93 ta yo'l belgisi (4 kategoriya)
- `public/assets/` — savol va belgilarga tegishli rasmlar

## Brend materiallari (favicon / OG rasm)

`public/favicon.svg`, `public/icon-*.png`, `public/apple-touch-icon.png` va `public/og-image.png` `scripts/generate-brand-assets.mjs` skripti orqali generatsiya qilingan. Brend rangi yoki matnini o'zgartirsangiz, qayta generatsiya qiling:

```bash
node scripts/generate-brand-assets.mjs
```
