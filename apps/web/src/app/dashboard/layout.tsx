import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { requireAuth } from '@/lib/security'
import { redirect } from 'next/navigation'

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  try {
    await requireAuth()
  } catch {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block w-64 border-r">
        <Sidebar className="h-full" />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/50 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
