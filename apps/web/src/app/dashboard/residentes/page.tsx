import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Mail, Phone, Home } from 'lucide-react'
import { getResidents } from '@/actions/residents'
import { AddResidentModal } from '@/components/dashboard/residentes/add-modal'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

function ResidentsLoading() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

async function ResidentsList() {
    const residents = await getResidents()

    if (residents.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Sin residentes registrados</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        Los residentes aparecerán aquí una vez que los vincules a sus respectivas unidades habitacionales.
                    </p>
                    <AddResidentModal />
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {residents.map((item) => (
                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {item.user.name[0]}{item.user.lastName?.[0] || ''}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{item.user.name} {item.user.lastName}</h3>
                                    {item.isOwner && (
                                        <Badge variant="outline" className="text-[10px] bg-sky-50 dark:bg-sky-950 text-sky-600 border-sky-200">
                                            Propietario
                                        </Badge>
                                    )}
                                    {item.user.isActive ? (
                                        <Badge variant="success" className="text-[10px]">Activo</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-[10px]">Inactivo</Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {item.user.email}
                                    </div>
                                    {item.user.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {item.user.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-sm font-medium justify-end">
                                    <Home className="h-4 w-4 text-muted-foreground" />
                                    Unidad {item.unit.unitNumber}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {item.unit.condominium.name}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function ResidentesPage() {
    return (
        <DashboardShell>
            <div className="flex items-center justify-between gap-4 mb-6">
                <DashboardHeader
                    heading="Residentes"
                    text="Administra el directorio de residentes y propietarios"
                    className="mb-0"
                />
                <AddResidentModal />
            </div>
            <Suspense fallback={<ResidentsLoading />}>
                <ResidentsList />
            </Suspense>
        </DashboardShell>
    )
}
