export function getErrorMessage(error, fallback = 'Something went wrong') {
  const msg = error?.response?.data?.message
  if (typeof msg === 'string' && msg.trim()) return msg
  if (typeof error?.message === 'string' && error.message.trim()) return error.message
  return fallback
}
