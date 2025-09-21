'use client'
import { useState } from 'react'
import { Users } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const emailTrim = email.trim()
    if (!emailTrim) { setError('Ingresa tu correo'); return }
    if (!password)  { setError('Ingresa tu contraseña'); return }

    try {
      setLoading(true)
      const user = await Users.findByEmail(emailTrim)
      if (!user) { setError('Usuario no encontrado'); return }
      if (!user.password || password !== user.password) {
        setError('Contraseña incorrecta'); return
      }
      login({ id: user.id, name: user.name, email: user.email, role: user.role })
      router.replace('/dashboard')
    } catch {
      setError('Ocurrió un error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-3">
      <form className="card grid gap-3" onSubmit={onSubmit} autoComplete="off">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        {error && <p className="text-red-600">{error}</p>}

        {/* inputs “trampa” para reducir autofill agresivo */}
        <input type="text" name="fake-user" className="hidden" autoComplete="username" />
        <input type="password" name="fake-pass" className="hidden" autoComplete="current-password" />

        <div>
          <label className="label">Correo</label>
          <input
            className="input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="tucorreo@ejemplo.com"
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
            placeholder="••••••••"
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
        </div>

        <button className="btn btn-primary w-full sm:w-fit" disabled={loading}>
          {loading ? 'Ingresando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
