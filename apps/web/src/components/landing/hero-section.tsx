import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Gestiona tu condominio
          <span className="text-primary"> de forma inteligente</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Sistema completo para la administración de condominios. Control de pagos,
          residentes, áreas comunes, gastos y más en una sola plataforma.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="w-full sm:w-auto">
              Comenzar gratis
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Ver demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
