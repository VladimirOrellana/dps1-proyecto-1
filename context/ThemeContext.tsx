'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type Ctx = { theme: Theme; toggle: () => void; set: (t: Theme) => void }
const ThemeCtx = createContext<Ctx>({ theme: 'light', toggle: () => {}, set: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  // primera carga: localStorage -> sistema -> light
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && (localStorage.getItem('theme') as Theme | null)) || null
    const sysDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial: Theme = saved ?? (sysDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return <ThemeCtx.Provider value={{ theme, toggle, set: setTheme }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
