import { useEffect, useState } from 'react'

const emptyForm = {
  title: '',
  description: '',
  completed: false,
}

export default function TaskModal({ open, mode = 'create', initialTask, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialTask) {
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        completed: Boolean(initialTask.completed),
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, mode, initialTask])

  if (!open) return null

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      ...(mode === 'edit' ? { completed: form.completed } : {}),
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-50 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {mode === 'edit' ? 'Edit task' : 'New task'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="task-title"
              required
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>
          <div>
            <label htmlFor="task-desc" className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="task-desc"
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>

          {mode === 'edit' && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.completed}
                onChange={(e) => handleChange('completed', e.target.checked)}
                className="rounded border-slate-300"
              />
              Completed
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Saving…' : mode === 'edit' ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
