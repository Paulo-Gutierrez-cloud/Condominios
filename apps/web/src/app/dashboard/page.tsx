import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@condominios/database'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Skeleton } from '@/components/ui/skeleton'
import { getCondominiums } from '@/actions/condominiums'
import { Building2, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateCondominiumModal } from '@/components/dashboard/condominios/create-modal'
import { StatsCards } from '@/components/dashboard/stats-cards'
import type { StatItem } from '@/components/dashboard/stats-cards'

import { Session } from 'next-auth'

async function getStats(session: Session): Promise<StatItem[]> {
  const { user } = session
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  if (user.role === 'RESIDENTE') {
    // Stats for Resident
    const [pendingPayments, nextReservation, announcements] = await Promise.all([
      prisma.payment.findMany({
        where: { userId: user.id, status: 'PENDIENTE' },
        select: { amount: true }
      }),
      prisma.reservation.findFirst({
        where: { userId: user.id, startDate: { gte: now }, status: 'APROBADA' },
        orderBy: { startDate: 'asc' },
        select: { startDate: true }
      }),
      prisma.announcement.count({
        where: {
          condominium: { units: { some: { users: { some: { userId: user.id } } } } },
          isImportant: true
        }
      })
    ])

    const totalBalance = pendingPayments.reduce((acc, p) => acc + p.amount, 0)

    return [
      {
        title: 'Saldo Pendiente',
        value: totalBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
        description: `${pendingPayments.length} pago(s) por realizar`,
        icon: 'CreditCard' as const
      },
      {
        title: 'Próxima Reserva',
        value: nextReservation ? nextReservation.startDate.toLocaleDateString() : 'Ninguna',
        description: nextReservation ? 'Confirmada' : 'No tienes planes hoy',
        icon: 'Calendar' as const
      },
      {
        title: 'Avisos Urgentes',
        value: announcements.toString(),
        description: 'Comunicados importantes',
        icon: 'Bell' as const
      }
    ]
  }

  // Stats for Admin
  const [
    totalCondominiums,
    totalUsers,
    paymentsThisMonth,
    paymentsLastMonth,
    incomeThisMonth,
    incomeLastMonth,
  ] = await Promise.all([
    prisma.condominium.count({
      where: user.role === 'SUPER_ADMIN' ? {} : {
        OR: [
          { ownerId: user.id },
          { admins: { some: { userId: user.id } } }
        ]
      }
    }),
    prisma.user.count({
      where: {
        isActive: true,
        units: {
          some: {
            unit: {
              condominium: user.role === 'SUPER_ADMIN' ? {} : {
                OR: [
                  { ownerId: user.id },
                  { admins: { some: { userId: user.id } } }
                ]
              }
            }
          }
        }
      }
    }),
    prisma.payment.count({
      where: {
        createdAt: { gte: startOfMonth },
        unit: {
          condominium: user.role === 'SUPER_ADMIN' ? {} : {
            OR: [
              { ownerId: user.id },
              { admins: { some: { userId: user.id } } }
            ]
          }
        }
      },
    }),
    prisma.payment.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        unit: {
          condominium: user.role === 'SUPER_ADMIN' ? {} : {
            OR: [
              { ownerId: user.id },
              { admins: { some: { userId: user.id } } }
            ]
          }
        }
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'PAGADO',
        paymentDate: { gte: startOfMonth },
        unit: {
          condominium: user.role === 'SUPER_ADMIN' ? {} : {
            OR: [
              { ownerId: user.id },
              { admins: { some: { userId: user.id } } }
            ]
          }
        }
      },
      _sum: { amountPaid: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'PAGADO',
        paymentDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        unit: {
          condominium: user.role === 'SUPER_ADMIN' ? {} : {
            OR: [
              { ownerId: user.id },
              { admins: { some: { userId: user.id } } }
            ]
          }
        }
      },
      _sum: { amountPaid: true },
    }),
  ])

  const currentIncome = incomeThisMonth._sum.amountPaid || 0
  const lastIncome = incomeLastMonth._sum.amountPaid || 0
  const incomeChange = lastIncome > 0 ? Math.round(((currentIncome - lastIncome) / lastIncome) * 100) : 0

  return [
    {
      title: 'Condomínios',
      value: totalCondominiums.toString(),
      description: `${totalCondominiums} activos`,
      icon: 'Building2' as const
    },
    {
      title: 'Residentes',
      value: totalUsers.toString(),
      description: 'Usuarios vinculados',
      icon: 'Users' as const
    },
    {
      title: 'Pagos Mes',
      value: paymentsThisMonth.toString(),
      description: `${paymentsThisMonth >= paymentsLastMonth ? '+' : ''}${paymentsThisMonth - paymentsLastMonth} vs mes ant.`,
      icon: 'CreditCard' as const
    },
    {
      title: 'Ingresos',
      value: currentIncome.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
      description: `${incomeChange >= 0 ? '+' : ''}${incomeChange}% vs mes ant.`,
      icon: 'TrendingUp' as const
    }
  ]
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-7 w-20 mt-2" />
          <Skeleton className="h-3 w-28 mt-2" />
        </div>
      ))}
    </div>
  )
}

async function StatsSection({ session }: { session: Session }) {
  const stats = await getStats(session)
  return <StatsCards stats={stats} />
}

async function CondominiumView({ role }: { role: string }) {
  const condominiums = await getCondominiums()

  if (condominiums.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {role === 'RESIDENTE' ? 'No estás vinculado a ningún condominio' : 'Sin condominios bajo gestión'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {role === 'RESIDENTE'
              ? 'Ponte en contacto con tu administración para que te envíen una invitación.'
              : 'Crea tu primer condominio para comenzar a gestionar residentes, pagos y más.'}
          </p>
          {role !== 'RESIDENTE' && <CreateCondominiumModal />}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {role === 'RESIDENTE' ? 'Tu Condominio' : 'Tus Condominios'}
        </h2>
        {role !== 'RESIDENTE' && <CreateCondominiumModal />}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {condominiums.map((condo) => (
          <Card key={condo.id} className="group overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                  {condo.name}
                </CardTitle>
                <Badge variant={condo.status === 'ACTIVO' ? 'success' : 'secondary'}>
                  {condo.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{condo.address}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" className="w-full gap-2">
                  <Link href={`/dashboard/condominios/${condo.slug}`}>
                    {role === 'RESIDENTE' ? 'Ver Detalles' : 'Administrar'} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  const { user } = session

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Hola, ${user.name}`}
        text={user.role === 'SUPER_ADMIN' ? 'Vista de monitoreo global' : 'Gestiona tus propiedades y residentes'}
      />

      {user.role === 'SUPER_ADMIN' ? (
        <Suspense fallback={<StatsLoading />}>
          <StatsSection session={session} />
        </Suspense>
      ) : (
        <Suspense fallback={<StatsLoading />}>
          <div className="space-y-8">
            <StatsSection session={session} />
            <CondominiumView role={user.role} />
          </div>
        </Suspense>
      )}
    </DashboardShell>
  )
}
