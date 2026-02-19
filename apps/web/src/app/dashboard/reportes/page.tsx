import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, TrendingUp, Users, Download, PieChart as PieChartIcon } from 'lucide-react'
import { getReportStats } from '@/actions/reports'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@condominios/utils'

function ReportsLoading() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

async function ReportsContent() {
    const stats = await getReportStats()

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Financial Health */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Salud Financiera
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-muted-foreground">Efectividad de Cobro</p>
                                    <div className="text-3xl font-bold">{stats.finances.paymentRate.toFixed(1)}%</div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Meta Mensual</p>
                                    <p className="text-sm font-medium">95.0%</p>
                                </div>
                            </div>

                            <div className="w-full bg-muted rounded-full h-3">
                                <div
                                    className="bg-emerald-500 h-3 rounded-full transition-all"
                                    style={{ width: `${stats.finances.paymentRate}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase">Cobrado</p>
                                    <p className="text-lg font-bold">{formatCurrency(stats.finances.totalCollected)}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase">Pendiente</p>
                                    <p className="text-lg font-bold">{formatCurrency(stats.finances.totalPending)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Occupancy Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Ocupación y Residentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tasa de Ocupación</p>
                                    <div className="text-3xl font-bold">{stats.occupancy.occupancyRate.toFixed(1)}%</div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{stats.occupancy.occupiedUnits} de {stats.occupancy.totalUnits}</p>
                                    <p className="text-xs text-muted-foreground">Unidades Habitadas</p>
                                </div>
                            </div>

                            <div className="w-full bg-muted rounded-full h-3">
                                <div
                                    className="bg-blue-500 h-3 rounded-full transition-all"
                                    style={{ width: `${stats.occupancy.occupancyRate}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-2">
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <PieChartIcon className="h-4 w-4" />
                                    Ver desglose por edificio/torre
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <FileText className="h-4 w-4" />
                                    Descargar directorio actualizado
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                </Button>
                <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Generar PDF Mensual
                </Button>
            </div>
        </div>
    )
}

export default function ReportesPage() {
    return (
        <DashboardShell>
            <div className="mb-6">
                <DashboardHeader
                    heading="Reportes"
                    text="Análisis detallado de finanzas, ocupación y métricas operativas"
                />
            </div>
            <Suspense fallback={<ReportsLoading />}>
                <ReportsContent />
            </Suspense>
        </DashboardShell>
    )
}
