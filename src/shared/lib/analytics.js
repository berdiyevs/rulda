// Yandex Metrica: butun analitika kodi shu yerda. Komponentlar faqat track('...') chaqiradi.
//
// VITE_YM_ID bo'sh bo'lsa yoki lokal ishlab chiqishda (npm run dev) hech narsa yuklanmaydi va xato ham chiqmaydi.

const COUNTER_ID = Number(import.meta.env.VITE_YM_ID)
const ENABLED = import.meta.env.PROD && Number.isInteger(COUNTER_ID) && COUNTER_ID > 0
const TAG_URL = 'https://mc.yandex.ru/metrika/tag.js'

// Brauzer bo'yicha faqat bir marta yuboriladigan hodisalar.
const ONCE_GOALS = new Set(['first_answer'])

let initialized = false

function safely(fn) {
  try {
    fn()
  } catch {
    // Analitika hech qachon saytning ishlashiga xalaqit bermasligi kerak.
  }
}

export function initAnalytics() {
  if (!ENABLED || initialized) return
  initialized = true
  safely(() => {
    /* eslint-disable */
    ;(function (m, e, t, r, i, k, a) {
      m[i] =
        m[i] ||
        function () {
          ;(m[i].a = m[i].a || []).push(arguments)
        }
      m[i].l = 1 * new Date()
      k = e.createElement(t)
      a = e.getElementsByTagName(t)[0]
      k.async = 1
      k.src = r
      a.parentNode.insertBefore(k, a)
    })(window, document, 'script', TAG_URL, 'ym')
    /* eslint-enable */
    // defer: birinchi ko'rishni o'zimiz yuboramiz (trackPageView), shunda SPA'da ikki marta sanalmaydi.
    window.ym(COUNTER_ID, 'init', {
      defer: true,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
    })
  })
}

export function trackPageView(path) {
  if (!ENABLED || !initialized) return
  safely(() => window.ym(COUNTER_ID, 'hit', path))
}

export function track(goal, params) {
  if (!ENABLED || !initialized) return
  safely(() => {
    if (ONCE_GOALS.has(goal)) {
      const key = `rulda_goal_${goal}`
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, '1')
    }
    window.ym(COUNTER_ID, 'reachGoal', goal, params)
  })
}
