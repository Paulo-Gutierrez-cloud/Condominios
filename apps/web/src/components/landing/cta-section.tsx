import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="container text-center">
        <h2 className="text-3xl font-bold mb-4">
          ¿Listo para transformar la gestión de tu condominio?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Únete a cientos de administradores que ya confían en nuestra plataforma
          para gestionar sus condominios de manera eficiente.
        </p>
        <Link href="/auth/register">
          <Button size="lg">Crear cuenta gratuita</Button>
        </Link>
      </div>
    </section>
  )
}
