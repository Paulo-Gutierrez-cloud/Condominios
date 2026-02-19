'use server'

import { prisma } from '@condominios/database'
import { revalidatePath } from 'next/cache'
import { requireAuth, verifyUnitOwnership } from '@/lib/security'
import { z } from 'zod'
import { Prisma } from '@condominios/database'

const ReservationSchema = z.object({
    commonAreaId: z.string(),
    unitId: z.string(),
    title: z.string().min(3),
    description: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    needsInsurance: z.boolean().optional().default(false),
    depositAmount: z.number().optional().default(0),
})

export async function getReservations() {
    const { user, userId } = await requireAuth()

    const where: Prisma.ReservationWhereInput = {}

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

    return await prisma.reservation.findMany({
        where,
        include: {
            commonArea: true,
            unit: { select: { unitNumber: true } },
            user: { select: { name: true, lastName: true } }
        },
        orderBy: { startDate: 'desc' }
    })
}

export async function getCommonAreas() {
    const { user, userId } = await requireAuth()

    const where: Prisma.CommonAreaWhereInput = {}

    if (user.role === 'RESIDENTE') {
        where.condominium = {
            units: {
                some: {
                    users: {
                        some: { userId: userId }
                    }
                }
            }
        }
    } else {
        where.condominium = {
            OR: [
                { ownerId: userId },
                { admins: { some: { userId: userId } } }
            ]
        }
    }

    return await prisma.commonArea.findMany({
        where,
        include: {
            condominium: { select: { name: true } }
        }
    })
}

export async function toggleCommonAreaStatus(id: string, isOpen: boolean) {
    await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO'])

    await prisma.commonArea.update({
        where: { id },
        data: { isOpen }
    })

    revalidatePath('/dashboard/reservaciones')
    return { success: true }
}

export async function createReservation(data: z.infer<typeof ReservationSchema>) {
    const { userId } = await requireAuth()
    const validated = ReservationSchema.parse(data)

    // Hardening: Verify that the unit belongs to a condominium the user can access
    await verifyUnitOwnership(validated.unitId)

    // Check if the area is open
    const area = await prisma.commonArea.findUnique({
        where: { id: validated.commonAreaId },
        select: { isOpen: true, isAtemporal: true, condominiumId: true }
    })

    if (area && !area.isOpen && !area.isAtemporal) {
        return { success: false, error: 'Esta área se encuentra cerrada temporalmente (ej. mantenimiento o clima).' }
    }

    try {
        const reservation = await prisma.reservation.create({
            data: {
                ...validated,
                userId: userId,
                startDate: new Date(validated.startDate),
                endDate: new Date(validated.endDate),
                status: 'PENDIENTE',
                isDepositPaid: false,
            }
        })

        revalidatePath('/dashboard/reservaciones')
        return { success: true, data: reservation }
    } catch {
        return { success: false, error: 'Error al crear la reservación' }
    }
}

export async function cancelReservation(id: string) {
    const { user, userId } = await requireAuth()

    const reservation = await prisma.reservation.findUnique({
        where: { id },
        select: { userId: true, status: true }
    })

    if (!reservation) throw new Error('Reservación no encontrada')

    // Residents can only cancel their own pending reservations
    if (user.role === 'RESIDENTE' && reservation.userId !== userId) {
        throw new Error('No tienes permiso para cancelar esta reservación')
    }

    await prisma.reservation.update({
        where: { id },
        data: { status: 'CANCELADA' }
    })

    revalidatePath('/dashboard/reservaciones')
    return { success: true }
}

export async function markDepositPaid(id: string) {
    await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO', 'ADMIN_FINANZAS'])

    await prisma.reservation.update({
        where: { id },
        data: { isDepositPaid: true }
    })

    revalidatePath('/dashboard/reservaciones')
    return { success: true }
}
