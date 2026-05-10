/** In-memory access token (not persisted — refresh cookie restores session). */
let accessToken = null

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = token
}
