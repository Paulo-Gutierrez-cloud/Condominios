import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User, Bell, Shield } from 'lucide-react'
import { getUserProfile } from '@/actions/settings'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SettingsLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
}

async function SettingsContent() {
    const profile = await getUserProfile()

    if (!profile) return null

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle>Perfil de Usuario</CardTitle>
                    </div>
                    <CardDescription>
                        Gestiona tu información personal y cómo te ven los demás.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" defaultValue={profile.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input id="lastName" defaultValue={profile.lastName || ''} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue={profile.email} disabled className="bg-muted" />
                        <p className="text-[10px] text-muted-foreground italic">El email no puede ser modificado.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" defaultValue={profile.phone || ''} />
                    </div>
                    <div className="pt-2">
                        <Button>Guardar Cambios</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-amber-500" />
                            <CardTitle>Notificaciones</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span>Avisos por Email</span>
                            <Badge variant="outline">Activado</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Recibos de Pago</span>
                            <Badge variant="outline">Activado</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Reservaciones Confimadas</span>
                            <Badge variant="outline">Desactivado</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            <CardTitle>Seguridad</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span>Doble Factor (2FA)</span>
                            <Button variant="link" size="sm" className="h-auto p-0">Configurar</Button>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Cambiar Contraseña</span>
                            <Button variant="link" size="sm" className="h-auto p-0">Actualizar</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Section */}
            <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                    <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
                    </p>
                    <Button variant="destructive">Eliminar Cuenta</Button>
                </CardContent>
            </Card>
        </div>
    )
}

interface BadgeProps {
    variant?: 'outline' | 'default';
    children: React.ReactNode;
    className?: string;
}

function Badge({ variant, children, className }: BadgeProps) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${variant === 'outline' ? 'border-input bg-background' : ''
            } ${className}`}>
            {children}
        </span>
    )
}

export default function ConfiguracionPage() {
    return (
        <DashboardShell>
            <div className="mb-6">
                <DashboardHeader
                    heading="Configuración"
                    text="Gestiona tu cuenta, preferencias y seguridad de la plataforma"
                />
            </div>
            <Suspense fallback={<SettingsLoading />}>
                <SettingsContent />
            </Suspense>
        </DashboardShell>
    )
}
