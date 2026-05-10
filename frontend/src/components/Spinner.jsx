export default function Spinner({ className = '' }) {
  return (
    <div
      className={`inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700 ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
