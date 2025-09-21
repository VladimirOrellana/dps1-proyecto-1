import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import Nav from '@/components/Nav'
import { ThemeProvider } from '@/context/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Projector',
  description: 'Simple projects & tasks',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Pre-fija el tema antes de hidratar (persistente entre páginas) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (!t) {
      t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Nav />
            <main className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-6">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
