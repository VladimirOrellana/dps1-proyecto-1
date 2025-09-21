'use client'
import { useEffect, useMemo, useState } from 'react'
import { Tasks, Users } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

type Role = 'manager' | 'user'

export default function TaskQuickEdit({
  taskId,
  initialTitle,
  initialAssignee,
  onSaved,
  onCancel,
}: {
  taskId: number
  initialTitle: string
  initialAssignee?: string
  onSaved: () => void      // callback para refrescar la lista en el padre
  onCancel: () => void     // cerrar el editor
}) {
  const { user } = useAuth()
  const isManager = user?.role === 'manager'

  const [title, setTitle] = useState(initialTitle)
  const [assignee, setAssignee] = useState(initialAssignee ?? '')
  const [users, setUsers] = useState<Array<{ id: number; name: string; role: Role }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    Users.list()
      .then((all) => {
        if (!mounted) return
        setUsers(all.map((u: any) => ({ id: u.id, name: u.name, role: u.role })))
      })
      .catch(() => setUsers([]))
    return () => { mounted = false }
  }, [])

  const userNames = useMemo(() => users.map(u => u.name), [users])

  async function save() {
    setError(null)
    const t = title.trim()
    const a = assignee.trim()

    if (!t) { setError('Ingresa un título'); return }
    if (!a || !userNames.includes(a)) { setError('Selecciona un asignado válido de la lista'); return }

    try {
      setLoading(true)
      await Tasks.update(taskId, { title: t, assignee: a })
      onSaved()
      onCancel()
    } catch {
      setError('No se pudo guardar la edición')
    } finally {
      setLoading(false)
    }
  }

  if (!isManager) return null

  return (
    <div className="card grid gap-3 p-3">
      <div>
        <label className="label">Título</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Edita el título…"
        />
      </div>

      <div>
        <label className="label">Asignado</label>
        <input
          className="input"
          list="assignees"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="Elige nuevo asignado…"
        />
        <datalist id="assignees">
          {users.map((u) => (
            <option key={u.id} value={u.name}>
              {u.name} ({u.role})
            </option>
          ))}
        </datalist>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button className="btn btn-primary btn-sm" onClick={save} disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
