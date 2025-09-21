'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Projects, Tasks } from '@/lib/api'

type Status = 'todo' | 'doing' | 'done'

const statusLabel: Record<Status, string> = {
  todo: 'Por hacer',
  doing: 'En progreso',
  done: 'Hecha',
}

// Clases de color por estado (chip y borde izquierdo)
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

export default function DashboardPage() {
  const { user, isAuthenticated, ready } = useAuth()
  const router = useRouter()

  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace('/login')
  }, [ready, isAuthenticated, router])

  async function refresh() {
    try {
      setLoading(true)
      const [p, t] = await Promise.all([Projects.list(), Tasks.list()])
      setProjects(p)
      setTasks(t)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) refresh()
  }, [isAuthenticated])

  // tareas visibles segun rol
  const visibleTasks = useMemo(() => {
    if (!user) return []
    if (user.role === 'manager') return tasks
    return tasks.filter(
      (tk) => (tk.assignee || '').toLowerCase() === user.name.toLowerCase()
    )
  }, [tasks, user])

  // proyectos visibles segun rol
  const visibleProjects = useMemo(() => {
    if (!user) return []
    if (user.role === 'manager') return projects
    const myProjectIds = new Set(visibleTasks.map((t) => t.projectId))
    return projects.filter((p) => myProjectIds.has(p.id))
  }, [projects, user, visibleTasks])

  // progreso general (sobre tareas visibles)
  const progressPct = useMemo(() => {
    if (!visibleTasks.length) return 0
    const done = visibleTasks.filter((t) => t.status === 'done').length
    return Math.round((done / visibleTasks.length) * 100)
  }, [visibleTasks])

  // progreso por proyecto (sobre tareas visibles de ese proyecto)
  function projectProgress(projectId: number) {
    const ts = visibleTasks.filter((t) => t.projectId === projectId)
    if (!ts.length) return { pct: 0, total: 0, done: 0 }
    const done = ts.filter((t) => t.status === 'done').length
    const pct = Math.round((done / ts.length) * 100)
    return { pct, total: ts.length, done }
  }

  async function changeStatus(taskId: number, next: Status) {
    try {
      setSavingId(taskId)
      // update optimista
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: next } : t)))
      await Tasks.update(taskId, { status: next })
    } catch {
      await refresh()
    } finally {
      setSavingId(null)
    }
  }

  function canEditStatus(t: any) {
    if (!user) return false
    if (user.role === 'manager') return true
    return (t.assignee || '').toLowerCase() === user.name.toLowerCase()
  }

  if (!isAuthenticated) return null

  return (
    <div className="grid gap-6">
      {/* header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold">Hola{user ? `, ${user.name}` : ''} </h1>
        <div className="text-sm opacity-80">
          Rol:{' '}
          <span className="font-medium">
            {user?.role === 'manager' ? 'Gerente' : 'Usuario'}
          </span>
        </div>
      </header>

      {/* tarjetas compactas */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="tracking-wide text-xs opacity-70">Proyectos</div>
          <div className="text-3xl font-semibold mt-1">{visibleProjects.length}</div>
        </div>
        <div className="card p-4">
          <div className="tracking-wide text-xs opacity-70">Tareas</div>
          <div className="text-3xl font-semibold mt-1">{visibleTasks.length}</div>
        </div>
        <div className="card p-4">
          <div className="tracking-wide text-xs opacity-70">Progreso general</div>
          <div className="text-3xl font-semibold mt-1">{progressPct}%</div>
          <div className="h-2 w-full bg-gray-200 rounded mt-2">
            <div className="h-2 bg-green-500 rounded" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </section>

      {/* progreso por proyecto */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleProjects.map((p) => {
          const { pct, total, done } = projectProgress(p.id)
          return (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{p.name}</div>
                  {p.description && (
                    <div className="text-sm text-gray-600 break-words">{p.description}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-semibold">{pct}%</div>
                  <div className="text-xs opacity-70">
                    ({done}/{total} hechas)
                  </div>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded mt-3">
                <div className="h-2 bg-indigo-500 rounded" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
        {!visibleProjects.length && (
          <div className="card p-4">
            <p className="text-sm opacity-70">No hay proyectos para mostrar.</p>
          </div>
        )}
      </section>

      {/* tareas agrupadas por proyecto */}
      <section className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tareas por proyecto</h2>
          <Link className="text-sm underline" href="/projects">
            Ir a Proyectos
          </Link>
        </div>

        {loading ? (
          <p className="mt-3 text-sm opacity-70">Cargando…</p>
        ) : (
          <GroupedTasks
            projects={projects}
            visibleTasks={visibleTasks}
            canEditStatus={canEditStatus}
            changeStatus={changeStatus}
            savingId={savingId}
          />
        )}
      </section>
    </div>
  )
}

/* --------- Componente interno: agrupa tareas por proyecto --------- */
function GroupedTasks({
  projects,
  visibleTasks,
  canEditStatus,
  changeStatus,
  savingId,
}: {
  projects: any[]
  visibleTasks: any[]
  canEditStatus: (t: any) => boolean
  changeStatus: (taskId: number, next: Status) => void
  savingId: number | null
}) {
  // mapear tareas visibles por projectId
  const byProject = new Map<number, any[]>()
  for (const t of visibleTasks) {
    byProject.set(t.projectId, [...(byProject.get(t.projectId) || []), t])
  }

  // ordenar proyectos por nombre
  const entries = Array.from(byProject.entries()).sort((a, b) => {
    const pa = projects.find((p) => p.id === a[0])
    const pb = projects.find((p) => p.id === b[0])
    return (pa?.name || '').localeCompare(pb?.name || '')
  })

  if (!entries.length) {
    return <p className="text-sm opacity-70 mt-3">No hay tareas para mostrar.</p>
  }

  return (
    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {entries.map(([projectId, group]) => {
        const project = projects.find((p) => p.id === projectId)
        const total = group.length
        const done = group.filter((t: any) => t.status === 'done').length
        const pct = Math.round((done / total) * 100)

        return (
          <div key={projectId} className="card p-4">
            {/* Header del proyecto */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div
                  className="font-semibold truncate"
                  title={project?.name || `Proyecto #${projectId}`}
                >
                  {project?.name || `Proyecto #${projectId}`}
                </div>
                {project?.description && (
                  <div className="text-sm text-gray-600 break-words">
                    {project.description}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-semibold">{pct}%</div>
                <div className="text-xs opacity-70">
                  ({done}/{total} hechas)
                </div>
              </div>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded mt-3">
              <div className="h-2 bg-indigo-500 rounded" style={{ width: `${pct}%` }} />
            </div>

            {/* Tareas del proyecto: tarjeta vertical con colores por estado */}
            <ul className="mt-3 grid gap-2">
              {group
                .sort((a: any, b: any) => {
                  const rank: Record<string, number> = { doing: 0, todo: 1, done: 2 }
                  const r = (rank[a.status] ?? 9) - (rank[b.status] ?? 9)
                  return r !== 0 ? r : (a.title || '').localeCompare(b.title || '')
                })
                .map((t: any) => {
                  const styles = statusStyles(t.status as Status)
                  return (
                    <li
                      key={t.id}
                      className={`border rounded-xl p-3 grid gap-2 border-l-4 ${styles.left}`}
                    >
                      {/* Título + asignado */}
                      <div className="min-w-0">
                        <div className="font-medium" title={t.title}>
                          {t.title || '(Sin título)'}
                        </div>
                        <div
                          className="text-xs opacity-70 truncate"
                          title={t.assignee || 'Sin asignar'}
                        >
                          Asignado a: {t.assignee || 'Sin asignar'}
                        </div>
                      </div>

                      {/* Selector (editable) o chip de estado (solo lectura) */}
                      {canEditStatus(t) ? (
                        <select
                          className={`input status-select status-${t.status} w-full sm:w-56`}
                          value={t.status}
                          onChange={(e) => changeStatus(t.id, e.target.value as Status)}
                          disabled={savingId === t.id}
                          aria-label={`Cambiar estado de ${t.title || 'tarea'}`}
                        >
                          <option value="todo">Por hacer</option>
                          <option value="doing">En progreso</option>
                          <option value="done">Hecha</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${styles.chipBg} ${styles.chipText} ${styles.chipBorder}`}
                        >
                          {statusLabel[(t.status as Status) ?? 'todo']}
                        </span>
                      )}
                    </li>
                  )
                })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
