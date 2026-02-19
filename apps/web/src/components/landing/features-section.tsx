import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CreditCard, Users, Calendar, Bell, FileText } from 'lucide-react'

const features = [
  {
    icon: Building2,
    title: 'Gestión de Propiedades',
    description: 'Administra edificios, unidades y áreas comunes de manera eficiente.',
  },
  {
    icon: CreditCard,
    title: 'Control de Pagos',
    description: 'Registra cuotas, genera estados de cuenta y realiza seguimiento de pagos.',
  },
  {
    icon: Users,
    title: 'Residentes',
    description: 'Mantén un registro completo de propietarios e inquilinos.',
  },
  {
    icon: Calendar,
    title: 'Reservaciones',
    description: 'Sistema de reservaciones para áreas comunes con calendario visual.',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Envía avisos y notificaciones a los residentes automáticamente.',
  },
  {
    icon: FileText,
    title: 'Reportes',
    description: 'Genera reportes financieros y de ocupación en tiempo real.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">
          Todo lo que necesitas en un solo lugar
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
