import { NextResponse } from 'next/server'
import { prisma } from '@condominios/database'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { token, name, lastName, password } = body

        const invitation = await prisma.userInvitation.findUnique({
            where: { token },
        })

        if (!invitation || invitation.status !== 'PENDIENTE' || invitation.expiresAt < new Date()) {
            return NextResponse.json({ message: 'Invitación inválida o expirada' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Using a transaction to ensure atomic operations
        await prisma.$transaction(async (tx) => {
            // 1. Create the user
            const user = await tx.user.create({
                data: {
                    email: invitation.email,
                    password: hashedPassword,
                    name,
                    lastName,
                    role: invitation.role,
                    isActive: true,
                    emailVerified: new Date(),
                }
            })

            // 2. Link to unit if applicable
            if (invitation.unitId) {
                await tx.userUnit.create({
                    data: {
                        userId: user.id,
                        unitId: invitation.unitId,
                        isResident: true,
                        isOwner: invitation.role === 'PROPIETARIO',
                    }
                })

                // Update unit status
                await tx.unit.update({
                    where: { id: invitation.unitId },
                    data: { status: 'OCUPADA' }
                })
            }

            // 3. Mark invitation as accepted
            await tx.userInvitation.update({
                where: { id: invitation.id },
                data: { status: 'ACEPTADA' }
            })
        })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error('Invitation accept error:', error)
        return NextResponse.json({ message: 'Error interno al procesar la invitación' }, { status: 500 })
    }
}
