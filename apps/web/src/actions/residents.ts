'use server'

import { prisma } from '@condominios/database'
import { revalidatePath } from 'next/cache'
import { requireAuth, verifyUnitOwnership } from '@/lib/security'
import { z } from 'zod'

const ResidentSchema = z.object({
    name: z.string().min(2),
    lastName: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    unitId: z.string(),
    isOwner: z.boolean().default(false),
})

export async function getResidents() {
    const { userId } = await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO', 'ADMIN_FINANZAS'])

    return await prisma.userUnit.findMany({
        where: {
            unit: {
                condominium: {
                    OR: [
                        { ownerId: userId },
                        { admins: { some: { userId: userId } } }
                    ]
                }
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    isActive: true
                }
            },
            unit: {
                include: {
                    condominium: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function addResident(data: z.infer<typeof ResidentSchema>) {
    await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO'])
    const validated = ResidentSchema.parse(data)

    // Security Hardening: Verify that the unit belongs to a condominium the admin manages
    await verifyUnitOwnership(validated.unitId)

    try {
        let user = await prisma.user.findUnique({
            where: { email: validated.email.toLowerCase() }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: validated.email.toLowerCase(),
                    name: validated.name,
                    lastName: validated.lastName,
                    phone: validated.phone,
                    role: 'RESIDENTE',
                }
            })
        }

        const existingLink = await prisma.userUnit.findUnique({
            where: {
                userId_unitId: {
                    userId: user.id,
                    unitId: validated.unitId
                }
            }
        })

        if (existingLink) {
            return { success: false, error: 'El usuario ya está vinculado a esta unidad' }
        }

        await prisma.userUnit.create({
            data: {
                userId: user.id,
                unitId: validated.unitId,
                isOwner: validated.isOwner,
                isResident: true,
            }
        })

        revalidatePath('/dashboard/residentes')
        return { success: true }
    } catch {
        return { success: false, error: 'Hubo un problema al registrar al residente' }
    }
}

export async function getUnitsForAdmin() {
    const { userId } = await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO'])

    return await prisma.unit.findMany({
        where: {
            condominium: {
                OR: [
                    { ownerId: userId },
                    { admins: { some: { userId: userId } } }
                ]
            }
        },
        include: {
            condominium: {
                select: { name: true }
            }
        },
        orderBy: [
            { condominium: { name: 'asc' } },
            { unitNumber: 'asc' }
        ]
    })
}
