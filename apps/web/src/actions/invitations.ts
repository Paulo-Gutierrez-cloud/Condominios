'use server'

import { prisma } from '@condominios/database'
import { revalidatePath } from 'next/cache'
import { requireAuth, verifyOwnership, verifyUnitOwnership } from '@/lib/security'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { Role } from '@condominios/database'

const InvitationSchema = z.object({
    email: z.string().email('Email inválido'),
    unitId: z.string().optional(),
    role: z.enum(['RESIDENTE', 'PROPIETARIO', 'INQUILINO', 'ADMIN_CONDOMINIO', 'ADMIN_FINANZAS', 'PORTERO']),
    condominiumId: z.string(),
})

export async function sendInvitation(data: z.infer<typeof InvitationSchema>) {
    const { userId } = await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO'])
    const validated = InvitationSchema.parse(data)

    // Security check: Verify admin has access to this specific condominium
    await verifyOwnership(validated.condominiumId)

    // If a unit is specified, verify it belongs to that condominium
    if (validated.unitId) {
        await verifyUnitOwnership(validated.unitId)
    }

    // Generate a secure token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    try {
        const invitation = await prisma.userInvitation.create({
            data: {
                email: validated.email.toLowerCase().trim(),
                unitId: validated.unitId,
                role: validated.role as Role,
                token,
                invitedById: userId,
                expiresAt,
            }
        })

        // In a real app, we would send an email here.
        // For now, we return the link so the admin can copy it.
        const invitationLink = `${process.env.NEXTAUTH_URL}/auth/invitation/${token}`

        revalidatePath('/dashboard/residentes')
        return {
            success: true,
            data: {
                id: invitation.id,
                link: invitationLink
            }
        }
    } catch {
        return { success: false, error: 'Error al enviar la invitación' }
    }
}

export async function getInvitations(condominiumId: string) {
    await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO'])
    await verifyOwnership(condominiumId)

    return await prisma.userInvitation.findMany({
        where: {
            unit: {
                condominiumId
            }
        },
        include: {
            unit: {
                select: { unitNumber: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function cancelInvitation(id: string) {
    await requireAuth(['SUPER_ADMIN', 'ADMIN_CONDOMINIO'])

    // Get invitation to find its condominiumId
    const invitation = await prisma.userInvitation.findUnique({
        where: { id },
        include: { unit: { select: { condominiumId: true } } }
    })

    if (!invitation) throw new Error('Invitación no encontrada')

    // We need to verify ownership based on the unit's condominium
    if (invitation.unit) {
        await verifyOwnership(invitation.unit.condominiumId)
    }

    await prisma.userInvitation.update({
        where: { id },
        data: { status: 'CANCELADA' }
    })

    revalidatePath('/dashboard/residentes')
    return { success: true }
}
