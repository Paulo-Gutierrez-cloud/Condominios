'use server'

import { prisma } from '@condominios/database'
import { revalidatePath } from 'next/cache'
import { requireAuth, verifyUnitOwnership } from '@/lib/security'
import { z } from 'zod'
import { Prisma } from '@condominios/database'

const PaymentSchema = z.object({
    unitId: z.string(),
    userId: z.string(),
    amount: z.number().positive(),
    dueDate: z.string(),
    notes: z.string().optional(),
})

export async function getPayments() {
    const { user, userId } = await requireAuth()

    const where: Prisma.PaymentWhereInput = {}

    if (user.role === 'RESIDENTE') {
        where.userId = userId
    } else {
        where.unit = {
            condominium: {
                OR: [
                    { ownerId: userId },
                    { admins: { some: { userId } } }
                ]
            }
        }
    }

    return await prisma.payment.findMany({
        where,
        include: {
            user: {
                select: { name: true, lastName: true }
            },
            unit: {
                select: { unitNumber: true, condominium: { select: { name: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createPayment(data: z.infer<typeof PaymentSchema>) {
    const validated = PaymentSchema.parse(data)

    // Hardening: Verify that the unit belongs to a condominium the user can access
    await verifyUnitOwnership(validated.unitId)

    try {
        const payment = await prisma.payment.create({
            data: {
                ...validated,
                dueDate: new Date(validated.dueDate),
                status: 'PENDIENTE',
            }
        })

        revalidatePath('/dashboard/pagos')
        return { success: true, data: payment }
    } catch {
        return { success: false, error: 'Error al registrar el pago' }
    }
}

export async function getPaymentStats() {
    const { user, userId } = await requireAuth()

    const where: Prisma.PaymentWhereInput = {}

    if (user.role === 'RESIDENTE') {
        where.userId = userId
    } else {
        where.unit = {
            condominium: {
                OR: [
                    { ownerId: userId },
                    { admins: { some: { userId } } }
                ]
            }
        }
    }

    const stats = await prisma.payment.groupBy({
        by: ['status'],
        where,
        _sum: { amount: true },
        _count: { id: true }
    })

    const totalCollected = stats.find(s => s.status === 'PAGADO')?._sum.amount || 0
    const totalPending = stats.find(s => s.status === 'PENDIENTE')?._sum.amount || 0
    const totalCount = stats.reduce((acc, s) => acc + s._count.id, 0)
    const pendingCount = stats.find(s => s.status === 'PENDIENTE')?._count.id || 0

    return {
        totalCollected,
        totalPending,
        totalCount,
        pendingCount
    }
}
