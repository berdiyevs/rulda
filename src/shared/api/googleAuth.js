let scriptPromise = null

function loadGoogleScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = () => reject(new Error('Google skripti yuklanmadi'))
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

export async function getGoogleAccessToken() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Google Client ID sozlanmagan')

  await loadGoogleScript()

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.access_token)
        }
      },
      error_callback: (err) => reject(new Error(err?.type || 'Google xatosi')),
    })
    client.requestAccessToken()
  })
}
