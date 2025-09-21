'use client'
import { useEffect, useState, useMemo } from 'react'
import { Projects, Tasks } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import ProjectForm from '@/components/ProjectForm'
import TaskForm from '@/components/TaskForm'
import TaskQuickEdit from '@/components/TaskQuickEdit'
import { useRouter } from 'next/navigation'

type Status = 'todo' | 'doing' | 'done'

const statusLabel: Record<Status, string> = {
  todo: 'Por hacer',
  doing: 'En progreso',
  done: 'Hecha',
}

// Colores para chip/borde según estado
function statusStyles(s: Status) {
  switch (s) {
    case 'doing':
      return {
        chipBg: 'bg-yellow-100',
        chipText: 'text-yellow-800',
        chipBorder: 'border-yellow-200',
        left: 'border-l-yellow-400',
      }
    case 'done':
      return {
        chipBg: 'bg-green-100',
        chipText: 'text-green-800',
        chipBorder: 'border-green-200',
        left: 'border-l-green-500',
      }
    default:
      return {
        chipBg: 'bg-gray-100',
        chipText: 'text-gray-700',
        chipBorder: 'border-gray-200',
        left: 'border-l-gray-300',
      }
  }
}

// Colores del <select> según estado
function statusSelectClasses(s: Status) {
  switch (s) {
    case 'doing':
      return 'border-yellow-300 bg-yellow-50 focus:ring-yellow-400'
    case 'done':
      return 'border-green-300 bg-green-50 focus:ring-green-400'
    default:
      return 'border-gray-300 bg-white focus:ring-gray-400'
  }
}

export default function ProjectsPage() {
  const { isAuthenticated, ready, user } = useAuth()
  const router = useRouter()

  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [selected, setSelected] = useState<number | null>(null)

  // edición / guardado
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace('/login')
  }, [ready, isAuthenticated, router])

  async function refresh() {
    const [p, t] = await Promise.all([
      Projects.list(),
      Tasks.list(selected || undefined),
    ])
    setProjects(p)
    setTasks(t)
  }

  useEffect(() => {
    if (isAuthenticated) refresh()
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
    setEditingTaskId(null) // cerrar editor al cambiar filtro
  }, [selected])

  const allVisibleProjects = useMemo(
    () => (selected ? projects.filter(p => p.id === selected) : projects),
    [projects, selected]
  )

  function canEditStatus(t: any) {
    if (!user) return false
    if (user.role === 'manager') return true
    return (t.assignee || '').toLowerCase() === user.name.toLowerCase()
  }

  async function changeStatus(taskId: number, next: Status) {
    try {
      setSavingId(taskId)
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: next } : t))) // optimista
      await Tasks.update(taskId, { status: next })
    } finally {
      setSavingId(null)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="grid gap-6">
      {/* Filtro por proyecto */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="input w-full sm:w-64"
          value={selected ?? ''}
          onChange={e => setSelected(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Todos los proyectos</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Crear proyecto (solo gerente) */}
      {user?.role === 'manager' && <ProjectForm onCreated={refresh} />}

      {/* Tarjetas de proyectos */}
      <div className="grid md:grid-cols-2 gap-4">
        {allVisibleProjects.map(p => (
          <div key={p.id} className="card grid gap-3">
            {/* Header Proyecto */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.name}</div>
                {p.description && (
                  <div className="text-sm text-gray-600 break-words">{p.description}</div>
                )}
              </div>
              {user?.role === 'manager' && (
                <button
                  className="btn btn-secondary shrink-0"
                  onClick={async () => {
                    await Projects.remove(p.id)
                    await refresh()
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>

            {/* Lista de tareas del proyecto */}
            <div className="grid gap-2">
              {tasks
                .filter(t => t.projectId === p.id)
                .map(t => {
                  const styles = statusStyles(t.status as Status)
                  const isEditing = editingTaskId === t.id
                  return (
                    <div
                      key={t.id}
                      className={`border rounded-xl p-3 grid gap-2 border-l-4 ${styles.left}`}
                    >
                      {/* Row: título + asignado + estado/acciones */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate" title={t.title}>
                            {t.title || '(Sin título)'}
                          </div>
                          <div className="text-xs opacity-70 truncate" title={t.assignee || 'Sin asignar'}>
                            Asignado a: {t.assignee || 'Sin asignar'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Estado (select o chip) */}
                          {canEditStatus(t) ? (
                            <select
                              className={`input w-full sm:w-48 ${statusSelectClasses(t.status as Status)}`}
                              value={t.status}
                              onChange={e => changeStatus(t.id, e.target.value as Status)}
                              disabled={savingId === t.id}
                              aria-label={`Cambiar estado de ${t.title || 'tarea'}`}
                            >
                              <option value="todo">{statusLabel.todo}</option>
                              <option value="doing">{statusLabel.doing}</option>
                              <option value="done">{statusLabel.done}</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${styles.chipBg} ${styles.chipText} ${styles.chipBorder}`}
                            >
                              {statusLabel[(t.status as Status) ?? 'todo']}
                            </span>
                          )}

                          {/* Acciones solo gerente */}
                          {user?.role === 'manager' && (
                            <>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={async () => {
                                  await Tasks.remove(t.id)
                                  await refresh()
                                }}
                              >
                                Quitar
                              </button>
                              <button
                                className="btn btn-sm"
                                onClick={() => setEditingTaskId(isEditing ? null : t.id)}
                              >
                                {isEditing ? 'Cerrar' : 'Editar'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Editor rápido (título + asignado) */}
                      {user?.role === 'manager' && isEditing && (
                        <div className="pt-2 border-t">
                          <TaskQuickEdit
                            taskId={t.id}
                            initialTitle={t.title}
                            initialAssignee={t.assignee}
                            onSaved={async () => {
                              setEditingTaskId(null)
                              await refresh()
                            }}
                            onCancel={() => setEditingTaskId(null)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              {/* Empty state de tareas */}
              {!tasks.some(t => t.projectId === p.id) && (
                <p className="text-sm opacity-70">Este proyecto no tiene tareas.</p>
              )}
            </div>

            {/* Crear tarea (solo gerente) */}
            {user?.role === 'manager' && <TaskForm projectId={p.id} onCreated={refresh} />}
          </div>
        ))}
      </div>
    </div>
  )
}
