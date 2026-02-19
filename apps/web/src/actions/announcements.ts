'use server'

import { prisma } from '@condominios/database'
import { revalidatePath } from 'next/cache'
import { requireAuth, verifyOwnership } from '@/lib/security'
import { z } from 'zod'

const AnnouncementSchema = z.object({
    condominiumId: z.string(),
    title: z.string().min(5),
    content: z.string().min(10),
    isImportant: z.boolean().default(false),
})

export async function getAnnouncements() {
    const { userId } = await requireAuth()

    return await prisma.announcement.findMany({
        where: {
            condominium: {
                OR: [
                    { ownerId: userId },
                    { admins: { some: { userId } } },
                    { units: { some: { users: { some: { userId } } } } }
                ]
            }
        },
        include: {
            condominium: { select: { name: true } }
        },
        orderBy: { publishDate: 'desc' }
    })
}

export async function createAnnouncement(data: z.infer<typeof AnnouncementSchema>) {
    await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO'])
    const validated = AnnouncementSchema.parse(data)

    // Security Hardening: Verify that the admin has access to this condominium
    await verifyOwnership(validated.condominiumId)

    try {
        const announcement = await prisma.announcement.create({
            data: {
                ...validated,
                publishDate: new Date(),
            }
        })

        revalidatePath('/dashboard/avisos')
        return { success: true, data: announcement }
    } catch {
        return { success: false, error: 'Error al publicar el aviso' }
    }
}
