/** Lets the API layer clear auth when refresh fails (no Redux needed). */
let onSessionInvalid = () => {}

export function setSessionInvalidHandler(fn) {
  onSessionInvalid = typeof fn === 'function' ? fn : () => {}
}

export function notifySessionInvalid() {
  onSessionInvalid()
}
