// Minimal service worker: faqat brauzer saytni "o'rnatiladigan ilova" deb tan olishi uchun kerak.
// HECH NARSA KESHLAMAYDI: barcha so'rovlar odatdagidek tarmoqdan o'tadi, shuning uchun
// foydalanuvchilar hech qachon saytning eski versiyasida qolib ketmaydi.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
// Bo'sh fetch handler (respondWith chaqirilmaydi): so'rovlar o'zgarishsiz tarmoqqa ketadi.
self.addEventListener('fetch', () => {})
