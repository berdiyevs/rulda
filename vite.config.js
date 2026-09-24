import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // Production build backend manzilisiz chiqib ketmasin (aks holda sayt localhost:8000 ga murojaat qiladi).
  if (command === 'build') {
    for (const key of ['VITE_API_URL', 'VITE_GOOGLE_CLIENT_ID']) {
      if (!env[key] && !process.env[key]) {
        throw new Error(`${key} sozlanmagan. .env faylida yoki hosting (Netlify) Environment variables bo'limida belgilang.`)
      }
    }
    const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL
    if (mode === 'production' && /localhost|127\.0\.0\.1/.test(apiUrl)) {
      throw new Error(`VITE_API_URL production uchun localhost bo'lishi mumkin emas: ${apiUrl}`)
    }
  }

  return {
    plugins: [react()],
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          // Kutubxonalar alohida chunk'larda: ular kamdan-kam o'zgaradi va brauzer keshida uzoq qoladi.
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            mantine: ['@mantine/core', '@mantine/hooks', '@mantine/form', '@mantine/notifications'],
          },
        },
      },
    },
  }
})
