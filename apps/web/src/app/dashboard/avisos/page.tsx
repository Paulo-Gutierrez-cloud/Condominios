import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Calendar, Info, AlertTriangle, Plus } from 'lucide-react'
import { getAnnouncements } from '@/actions/announcements'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatDate } from '@condominios/utils'

function AnnouncementsLoading() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

async function AnnouncementsList() {
    const announcements = await getAnnouncements()

    if (announcements.length === 0) {
        return (
            <Card className="border-dashed py-16">
                <CardContent className="flex flex-col items-center justify-center text-center">
                    <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Sin avisos</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        No hay comunicados o noticias disponibles en este momento.
                    </p>
                    <Button>Publicar primer aviso</Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {announcements.map((item) => (
                <Card key={item.id} className={item.isImportant ? 'border-primary/50 bg-primary/5' : ''}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${item.isImportant ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {item.isImportant ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold leading-none">{item.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(item.publishDate)}
                                        </span>
                                        <Badge variant="outline" className="text-[10px]">
                                            {item.condominium.name}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            {item.isImportant && (
                                <Badge variant="destructive">Urgente</Badge>
                            )}
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                            {item.content}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function AvisosPage() {
    return (
        <DashboardShell>
            <div className="flex items-center justify-between gap-4 mb-6">
                <DashboardHeader
                    heading="Avisos"
                    text="Comunicados oficiales y noticias del condominio"
                    className="mb-0"
                />
                <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo Aviso
                </Button>
            </div>
            <Suspense fallback={<AnnouncementsLoading />}>
                <AnnouncementsList />
            </Suspense>
        </DashboardShell>
    )
}
