'use server'

import { prisma } from '@condominios/database'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/security'
import { z } from 'zod'

const ProfileSchema = z.object({
    name: z.string().min(2),
    lastName: z.string().optional(),
    phone: z.string().optional(),
})

export async function getUserProfile() {
    const session = await requireAuth()

    return await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
        }
    })
}

export async function updateProfile(data: z.infer<typeof ProfileSchema>) {
    const session = await requireAuth()
    const validated = ProfileSchema.parse(data)

    try {
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: validated,
        })

        revalidatePath('/dashboard/configuracion')
        return { success: true, data: user }
    } catch {
        return { success: false, error: 'Error al actualizar el perfil' }
    }
}
