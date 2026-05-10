import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { createTask, deleteTask, fetchTasks, updateTask } from '../services/taskService'
import { getErrorMessage } from '../utils/error'
import Spinner from '../components/Spinner'
import TaskModal from '../components/TaskModal'

const PAGE_SIZE = 10

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()

  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  const [listLoading, setListLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingTask, setEditingTask] = useState(null)

  const loadTasks = useCallback(
    async (page = 1) => {
      setListLoading(true)
      try {
        const res = await fetchTasks({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch.trim(),
        })
        const data = res.data
        setTasks(data.tasks || [])
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } catch (err) {
        showToast(getErrorMessage(err, 'Could not load tasks'), 'error')
      } finally {
        setListLoading(false)
      }
    },
    [debouncedSearch, showToast]
  )

  useEffect(() => {
    loadTasks(1)
  }, [loadTasks])

  async function handleLogout() {
    setActionLoading(true)
    try {
      await logout()
      showToast('Logged out')
    } catch (err) {
      showToast(getErrorMessage(err, 'Logout failed'), 'error')
    } finally {
      setActionLoading(false)
    }
  }

  function openCreate() {
    setModalMode('create')
    setEditingTask(null)
    setModalOpen(true)
  }

  function openEdit(task) {
    setModalMode('edit')
    setEditingTask(task)
    setModalOpen(true)
  }

  async function handleModalSubmit(payload) {
    setActionLoading(true)
    try {
      if (modalMode === 'create') {
        await createTask(payload)
        showToast('Task created')
      } else {
        await updateTask(editingTask._id, payload)
        showToast('Task updated')
      }
      setModalOpen(false)
      await loadTasks(pagination.page)
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not save task'), 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return
    setActionLoading(true)
    try {
      await deleteTask(task._id)
      showToast('Task deleted')
      const nextPage =
        tasks.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page
      await loadTasks(nextPage)
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not delete task'), 'error')
    } finally {
      setActionLoading(false)
    }
  }

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages) return
    loadTasks(nextPage)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Task dashboard</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Hello{user?.name ? `, ${user.name}` : ''}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={actionLoading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            {actionLoading ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder="Search tasks…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 sm:max-w-xs"
            aria-label="Search tasks"
          />
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            New task
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {listLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : tasks.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-600">
              No tasks yet{debouncedSearch ? ' for this search' : ''}. Create one to get started.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium text-slate-900">{task.title}</h2>
                      {task.completed && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          Done
                        </span>
                      )}
                    </div>
                    {task.description ? (
                      <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-400">
                      Updated{' '}
                      {task.updatedAt
                        ? new Date(task.updatedAt).toLocaleString()
                        : new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(task)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(task)}
                      disabled={actionLoading}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-800 hover:bg-red-100 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!listLoading && tasks.length > 0 && (
          <nav className="mt-6 flex flex-col items-center justify-between gap-3 text-sm text-slate-600 sm:flex-row">
            <p>
              Page {pagination.page} of {pagination.totalPages}{' '}
              <span className="text-slate-400">({pagination.total} tasks)</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || listLoading}
                onClick={() => goToPage(pagination.page - 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || listLoading}
                onClick={() => goToPage(pagination.page + 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </main>

      <TaskModal
        open={modalOpen}
        mode={modalMode}
        initialTask={editingTask}
        loading={actionLoading}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  )
}
