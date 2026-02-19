import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, MapPin, Clock, Plus, User } from 'lucide-react'
import { getReservations, getCommonAreas } from '@/actions/reservations'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatDate } from '@condominios/utils'

function ReservationsLoading() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
}

async function ReservationsContent() {
    const [reservations, areas] = await Promise.all([
        getReservations(),
        getCommonAreas()
    ])

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Areas Comunes Panel */}
            <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Áreas Comunes
                </h3>
                {areas.length === 0 ? (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="p-6 text-center text-sm text-muted-foreground">
                            No hay áreas comunes configuradas.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {areas.map((area) => (
                            <Card key={area.id} className="hover:border-primary/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium">{area.name}</h4>
                                        <Badge variant={area.isOpen ? 'success' : 'secondary'} className="text-[10px]">
                                            {area.isOpen ? 'Abierto' : 'Cerrado'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                        {area.description || 'Sin descripción disponible.'}
                                    </p>
                                    <Button variant="outline" size="sm" className="w-full text-xs" disabled={!area.isOpen}>
                                        Reservar ahora
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Mis Reservaciones Panel */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Próximas Reservaciones
                    </h3>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Nueva Reserva
                    </Button>
                </div>

                {reservations.length === 0 ? (
                    <Card className="border-dashed py-12">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground max-w-xs">
                                No tienes reservaciones activas en este momento.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((res) => (
                            <Card key={res.id}>
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{res.title}</h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {res.commonArea?.name || 'Área General'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(res.startDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <div className="flex items-center gap-1 text-xs justify-end">
                                                    <User className="h-3 w-3" />
                                                    {res.user.name}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">Unidad {res.unit.unitNumber}</p>
                                            </div>
                                            <Badge variant={
                                                res.status === 'APROBADA' ? 'success' :
                                                    res.status === 'PENDIENTE' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {res.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ReservacionesPage() {
    return (
        <DashboardShell>
            <div className="mb-6">
                <DashboardHeader
                    heading="Reservaciones"
                    text="Cronograma de uso de áreas comunes y facilidades"
                />
            </div>
            <Suspense fallback={<ReservationsLoading />}>
                <ReservationsContent />
            </Suspense>
        </DashboardShell>
    )
}
