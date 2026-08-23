export function requestFullscreen() {
  const el = document.documentElement
  const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
  request?.call(el)?.catch?.(() => {})
}

export function exitFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) return
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen
  exit?.call(document)?.catch?.(() => {})
}
