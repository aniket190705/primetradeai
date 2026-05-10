/** Session storage key for cached user profile (after login/register). */
export const AUTH_USER_KEY = 'taskapp_user'

/** API base URL including `/api/v1`. */
export function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
}
