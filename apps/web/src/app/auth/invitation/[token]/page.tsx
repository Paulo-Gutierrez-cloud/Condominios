import { notFound } from 'next/navigation'
import { prisma } from '@condominios/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import { InvitationSignupForm } from '@/components/auth/invitation-signup-form'

interface InvitationPageProps {
    params: {
        token: string
    }
}

export default async function InvitationPage({ params }: InvitationPageProps) {
    const invitation = await prisma.userInvitation.findUnique({
        where: { token: params.token },
        include: {
            unit: {
                include: { condominium: true }
            }
        }
    })

    // Basic validation
    if (!invitation || invitation.status !== 'PENDIENTE' || invitation.expiresAt < new Date()) {
        notFound()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Bienvenido a {invitation.unit?.condominium.name}</CardTitle>
                    <CardDescription>
                        Estás invitado como {invitation.role.toLowerCase()} para la unidad {invitation.unit?.unitNumber}.
                        Completa tu perfil para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvitationSignupForm
                        token={params.token}
                        email={invitation.email}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
