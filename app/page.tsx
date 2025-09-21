// app/page.tsx (Server Component, sin 'use client')
import { redirect } from 'next/navigation'
export default function Home() {
  redirect('/login')
}
