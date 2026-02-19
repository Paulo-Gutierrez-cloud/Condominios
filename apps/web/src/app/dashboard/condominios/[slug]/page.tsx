import { notFound } from 'next/navigation'
import { prisma } from '@condominios/database'
import { DashboardShell } from '@/components/dashboard/shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, CreditCard, Calendar, Bell, MapPin, Share2, Settings } from 'lucide-react'
import { requireAuth } from '@/lib/security'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

async function getCondominiumBySlug(slug: string) {
    const session = await requireAuth()
    const { user } = session

    const condo = await prisma.condominium.findUnique({
        where: { slug },
        include: {
            _count: {
                select: { units: true, admins: true }
            },
            units: {
                take: 5,
                orderBy: { unitNumber: 'asc' }
            }
        }
    })

    if (!condo) return null

    // Security check: is the user authorized to see this condo?
    if (user.role !== 'SUPER_ADMIN') {
        const isAdmin = await prisma.condominiumAdmin.findUnique({
            where: {
                condominiumId_userId: {
                    condominiumId: condo.id,
                    userId: user.id
                }
            }
        })

        const isOwner = condo.ownerId === user.id

        // Also check if they are a resident in this condo
        const isResident = await prisma.userUnit.findFirst({
            where: {
                userId: user.id,
                unit: { condominiumId: condo.id }
            }
        })

        if (!isAdmin && !isOwner && !isResident) {
            return null
        }
    }

    return condo
}

export default async function CondominiumDetailPage({ params }: { params: { slug: string } }) {
    const condo = await getCondominiumBySlug(params.slug)

    if (!condo) {
        notFound()
    }

    return (
        <DashboardShell>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">{condo.name}</h1>
                        <Badge variant={condo.status === 'ACTIVO' ? 'success' : 'secondary'}>
                            {condo.status}
                        </Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{condo.address}, {condo.city}, {condo.state}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" /> Compartir
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" /> Configuración
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Unidades</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{condo._count.units}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{condo._count.admins}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Unidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {condo.units.length > 0 ? (
                                condo.units.map(unit => (
                                    <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Unidad {unit.unitNumber}</p>
                                            <p className="text-xs text-muted-foreground">Piso {unit.floor}</p>
                                        </div>
                                        <Badge variant="outline">Ocupada</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-center py-4 text-muted-foreground">No hay unidades registradas</p>
                            )}
                            <Button variant="ghost" className="w-full text-sm">Ver todas las unidades</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Avisos Recientes</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-3 border rounded-lg bg-orange-500/10 border-orange-500/20">
                                <p className="text-sm font-medium">Mantenimiento de Elevadores</p>
                                <p className="text-xs text-muted-foreground">Programado para mañana a las 10:00 AM</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm font-medium">Nueva Cuota de Mantenimiento</p>
                                <p className="text-xs text-muted-foreground">Ya disponible para pago en el sistema</p>
                            </div>
                            <Button variant="ghost" className="w-full text-sm">Ver todos los avisos</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    )
}
