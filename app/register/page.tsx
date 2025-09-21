'use client'
import { useState } from 'react'
import { Users } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'manager' | 'user'>('user')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const nameTrim = name.trim()
    const emailTrim = email.trim()

    if (!nameTrim || !emailTrim || !password) {
      setError('Completa todos los campos'); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError('Correo no válido'); return
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres'); return
    }

    try {
      setLoading(true)
      const existing = await Users.findByEmail(emailTrim)
      if (existing) { setError('Ese correo ya está registrado'); return }

      const created = await Users.register({ name: nameTrim, email: emailTrim, password, role })
      login({ id: created.id, name: created.name, email: created.email, role: created.role })
      router.replace('/dashboard')
    } catch {
      setError('No se pudo registrar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-3">
      <form className="card grid gap-3" onSubmit={onSubmit} autoComplete="off">
        {/* inputs “trampa” para autofill */}
        <input type="text" name="fake-user" className="hidden" autoComplete="username" />
        <input type="password" name="fake-pass" className="hidden" autoComplete="new-password" />

        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        {error && <p className="text-red-600">{error}</p>}

        <div>
          <label className="label">Nombre</label>
          <input
            className="input w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            required
          />
        </div>

        <div>
          <label className="label">Correo</label>
          <input
            className="input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="usuario@ejemplo.com"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
        </div>

        <div>
          <label className="label">Contraseña</label>
          <input
            className="input w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Mínimo 4 caracteres"
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
        </div>

        <div>
          <label className="label">Rol</label>
          <select
            className="input w-full"
            value={role}
            onChange={(e) => setRole(e.target.value as 'manager' | 'user')}
          >
            <option value="user">Usuario</option>
            <option value="manager">Gerente</option>
          </select>
        </div>

        <button className="btn btn-primary w-full sm:w-fit" disabled={loading}>
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  )
}
