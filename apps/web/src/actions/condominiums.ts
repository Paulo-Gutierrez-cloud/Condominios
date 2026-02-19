'use server'

import { prisma } from '@condominios/database'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/security'
import { z } from 'zod'
import { Prisma } from '@condominios/database'

const CondominiumSchema = z.object({
    name: z.string().min(3).max(100),
    slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().optional(),
    description: z.string().optional(),
})

export async function getCondominiums() {
    const { user, userId } = await requireAuth()

    const where: Prisma.CondominiumWhereInput = {}

    if (user.role === 'RESIDENTE') {
        where.units = {
            some: {
                users: {
                    some: { userId: userId }
                }
            }
        }
    } else if (user.role !== 'SUPER_ADMIN') {
        where.OR = [
            { ownerId: userId },
            { admins: { some: { userId: userId } } }
        ]
    }

    return await prisma.condominium.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { units: true, admins: true }
            }
        }
    })
}

export async function createCondominium(data: z.infer<typeof CondominiumSchema>) {
    const { userId } = await requireAuth()
    const validated = CondominiumSchema.parse(data)

    try {
        const condominium = await prisma.condominium.create({
            data: {
                ...validated,
                ownerId: userId,
            }
        })

        await prisma.condominiumAdmin.create({
            data: {
                condominiumId: condominium.id,
                userId: userId,
                role: 'ADMIN_CONDOMINIO',
            }
        })

        revalidatePath('/dashboard/condominios')
        return { success: true, data: condominium }
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return { success: false, error: 'Ya existe un condominio con ese slug' }
        }
        return { success: false, error: 'Error al crear el condominio' }
    }
}

export async function deleteCondominium(id: string) {
    const { userId, role } = await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO'])

    const condo = await prisma.condominium.findUnique({
        where: { id },
        select: { ownerId: true }
    })

    if (!condo) throw new Error('Condominio no encontrado')

    // Only owner or Super Admin can delete
    if (role !== 'SUPER_ADMIN' && condo.ownerId !== userId) {
        throw new Error('Solo el propietario puede eliminar el condominio')
    }

    await prisma.condominium.delete({
        where: { id }
    })

    revalidatePath('/dashboard/condominios')
    return { success: true }
}
