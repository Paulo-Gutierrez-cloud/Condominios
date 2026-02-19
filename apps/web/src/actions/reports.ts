'use server'

import { prisma, Prisma } from '@condominios/database'
import { requireAuth } from '@/lib/security'

export async function getReportStats() {
    const { userId } = await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO', 'ADMIN_FINANZAS'])

    const where: Prisma.PaymentWhereInput = {
        unit: {
            condominium: {
                OR: [
                    { ownerId: userId },
                    { admins: { some: { userId: userId } } }
                ]
            }
        }
    }

    // Financial stats via aggregation
    const financialStats = await prisma.payment.groupBy({
        by: ['status'],
        where,
        _sum: { amount: true }
    })

    const totalCollected = financialStats.find(s => s.status === 'PAGADO')?._sum.amount || 0
    const totalPending = financialStats.find(s => s.status === 'PENDIENTE')?._sum.amount || 0

    // Occupancy stats
    const units = await prisma.unit.findMany({
        where: {
            condominium: {
                OR: [
                    { ownerId: userId },
                    { admins: { some: { userId: userId } } }
                ]
            }
        },
        select: {
            id: true,
            users: { select: { id: true } }
        }
    })

    const totalUnits = units.length
    const occupiedUnits = units.filter(u => u.users.length > 0).length

    return {
        finances: {
            totalCollected,
            totalPending,
            paymentRate: (totalCollected + totalPending) > 0
                ? (totalCollected / (totalCollected + totalPending)) * 100
                : 0
        },
        occupancy: {
            totalUnits,
            occupiedUnits,
            occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0
        }
    }
}
