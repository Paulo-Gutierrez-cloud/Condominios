'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@condominios/utils'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Calendar,
  Bell,
  Settings,
  FileText,
} from 'lucide-react'

import { useSession } from 'next-auth/react'
import { canAccessRoute } from '@/lib/permissions'
import type { Role } from '@condominios/database'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Condominios', href: '/dashboard/condominios', icon: Building2 },
  { name: 'Residentes', href: '/dashboard/residentes', icon: Users },
  { name: 'Pagos', href: '/dashboard/pagos', icon: CreditCard },
  { name: 'Reservaciones', href: '/dashboard/reservaciones', icon: Calendar },
  { name: 'Avisos', href: '/dashboard/avisos', icon: Bell },
  { name: 'Reportes', href: '/dashboard/reportes', icon: FileText },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role as Role | undefined

  const filteredNavigation = navigationItems.filter((item) => {
    if (!userRole) return item.href === '/dashboard' || item.href === '/dashboard/configuracion'

    // Hide Reports for Residents
    if (userRole === 'RESIDENTE' && item.name === 'Reportes') return false

    return canAccessRoute(userRole, item.href)
  })

  return (
    <aside className={cn('flex flex-col bg-background', className)}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="font-bold text-lg" onClick={onNavigate}>
          🏢 Condominios
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} GestionaTuCondominio
        </p>
      </div>
    </aside>
  )
}
