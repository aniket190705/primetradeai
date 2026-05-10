import api from './api'

export async function fetchTasks({ page = 1, limit = 10, search = '' }) {
  const res = await api.get('/tasks', {
    params: { page, limit, search },
  })
  return res.data
}

export async function createTask(body) {
  const res = await api.post('/tasks', body)
  return res.data
}

export async function updateTask(id, body) {
  const res = await api.put(`/tasks/${id}`, body)
  return res.data
}

export async function deleteTask(id) {
  const res = await api.delete(`/tasks/${id}`)
  return res.data
}
