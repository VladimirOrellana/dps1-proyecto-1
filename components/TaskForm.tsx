'use client'
import { useEffect, useMemo, useState } from 'react';
import { Tasks, Users } from '@/lib/api';

export default function TaskForm({
  projectId,
  onCreated,
}: {
  projectId: number;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [users, setUsers] = useState<Array<{ id: number; name: string; role: 'manager' | 'user' }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    Users.list()
      .then((all) => {
        if (!mounted) return;
        setUsers(all.map((u: any) => ({ id: u.id, name: u.name, role: u.role })));
      })
      .catch(() => setUsers([]));
    return () => {
      mounted = false;
    };
  }, []);

  const userNames = useMemo(() => users.map((u) => u.name), [users]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Ingresa un título');
      return;
    }
    if (!assignee.trim() || !userNames.includes(assignee.trim())) {
      setError('Selecciona un usuario válido de la lista');
      return;
    }

    try {
      setLoading(true);
      await Tasks.create({
        title: title.trim(),
        status: 'todo',
        projectId,
        assignee: assignee.trim(),
      });
      setTitle('');
      setAssignee('');
      onCreated();
    } catch {
      setError('No se pudo crear la tarea');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card grid gap-3" onSubmit={submit} autoComplete="off">
      <h3 className="font-semibold">Add Task</h3>

      <div>
        <label className="label">Title</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Diseñar pantalla de login"
          required
        />
      </div>

      <div>
        <label className="label">Assignee</label>
        {/* Input con autocomplete (datalist) */}
        <input
          className="input w-full"
          list="assignees"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="Empieza a escribir un nombre…"
          required
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

      <button className="btn btn-primary w-fit" disabled={loading}>
        {loading ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}
