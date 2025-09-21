'use client'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

export default function Nav() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <nav className="nav">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold">Gestor de Proyectos</Link>
          <Link href="/projects" className="text-sm">Proyectos</Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de tema */}
          <button className="btn btn-ghost btn-sm" onClick={toggle} aria-label="Cambiar tema">
            {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
          </button>

          {user ? (
            <>
              <span className="text-sm badge">{user.role === 'manager' ? 'Gerente' : 'Usuario'}</span>
              <span className="text-sm">{user.name}</span>
              <button className="btn btn-secondary" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link className="btn btn-secondary" href="/login">Iniciar sesión</Link>
              <Link className="btn btn-primary" href="/register">Crear cuenta</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
