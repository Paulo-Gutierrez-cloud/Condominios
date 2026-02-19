import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, MapPin, Users, Trash2 } from 'lucide-react'
import { getCondominiums } from '@/actions/condominiums'
import { CreateCondominiumModal } from '@/components/dashboard/condominios/create-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

function CondominiumsLoading() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4 space-y-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

async function CondominiumsList() {
    const condominiums = await getCondominiums()

    if (condominiums.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Sin condominios aún</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        Crea tu primer condominio para comenzar a gestionar residentes, pagos y más.
                    </p>
                    <CreateCondominiumModal />
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {condominiums.map((condo) => (
                <Card key={condo.id} className="group overflow-hidden hover:shadow-md transition-all duration-200">
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
                            <span className="truncate">{condo.address}, {condo.city}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 py-2 border-y text-sm">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{condo._count.units} Unidades</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{condo._count.admins} Admins</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button asChild variant="outline" size="sm" className="flex-1">
                                <Link href={`/dashboard/condominios/${condo.slug}`}>
                                    Administrar
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" className="px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function CondominiumsPage() {
    return (
        <DashboardShell>
            <div className="flex items-center justify-between gap-4 mb-6">
                <DashboardHeader
                    heading="Condominios"
                    text="Gestiona tus condominios y sus configuraciones"
                    className="mb-0"
                />
                <CreateCondominiumModal />
            </div>
            <Suspense fallback={<CondominiumsLoading />}>
                <CondominiumsList />
            </Suspense>
        </DashboardShell>
    )
}
