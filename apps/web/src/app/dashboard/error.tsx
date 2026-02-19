'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Algo salió mal</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
                {error.message || 'Ocurrió un error inesperado al cargar el dashboard.'}
            </p>
            <Button onClick={reset} variant="outline">
                Reintentar
            </Button>
        </div>
    )
}
