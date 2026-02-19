import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownLeft, Clock, Search } from 'lucide-react'
import { getPayments, getPaymentStats } from '@/actions/payments'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@condominios/utils'

function PaymentsLoading() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Card>
                <CardContent className="p-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 border-b last:border-0 flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

async function PaymentsOverview() {
    const stats = await getPaymentStats()
    const payments = await getPayments()

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Recaudado</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalCollected)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Pagado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pendiente</CardTitle>
                        <ArrowDownLeft className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{formatCurrency(stats.totalPending)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stats.pendingCount} pagos pendientes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Vencimiento Hoy</CardTitle>
                        <Clock className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">Pagos críticos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Transacciones</CardTitle>
                        <Search className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registros totales</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Pagos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-muted-foreground font-medium">
                                    <th className="p-4 text-left">Residente/Unidad</th>
                                    <th className="p-4 text-left">Monto</th>
                                    <th className="p-4 text-left">Estado</th>
                                    <th className="p-4 text-left">Vencimiento</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No hay registros de pagos aún.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium">{payment.user.name} {payment.user.lastName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {payment.unit.condominium.name} — Unidad {payment.unit.unitNumber}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant={
                                                        payment.status === 'PAGADO' ? 'success' :
                                                            payment.status === 'PENDIENTE' ? 'secondary' :
                                                                'outline'
                                                    }
                                                    className="font-medium"
                                                >
                                                    {payment.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {formatDate(payment.dueDate)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm">Detalles</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PagosPage() {
    return (
        <DashboardShell>
            <div className="mb-6">
                <DashboardHeader
                    heading="Pagos"
                    text="Consolidado financiero y seguimiento de cuotas de mantenimiento"
                />
            </div>
            <Suspense fallback={<PaymentsLoading />}>
                <PaymentsOverview />
            </Suspense>
        </DashboardShell>
    )
}
