'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Bell, LogOut, User, Moon, Sun, Menu } from 'lucide-react'
import { Sidebar } from './sidebar'
import { useState } from 'react'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_CONDOMINIO: 'Admin',
  ADMIN_FINANZAS: 'Finanzas',
  PORTERO: 'Portero',
  RESIDENTE: 'Residente',
  PROPIETARIO: 'Propietario',
  INQUILINO: 'Inquilino',
}

export function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-6">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />

      {/* Right side controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" title="Notificaciones">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
            <Badge variant="secondary" className="mt-1 text-[10px]">
              {ROLE_LABELS[session?.user?.role || ''] || session?.user?.role}
            </Badge>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
