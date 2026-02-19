import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'GestionaTuCondominio - Sistema de Gestión de Condominios',
    template: '%s | GestionaTuCondominio',
  },
  description: 'Sistema completo de gestión y administración de condominios. Control de pagos, residentes, áreas comunes y más.',
  keywords: ['condominios', 'gestión', 'administración', 'pagos', 'residentes'],
  authors: [{ name: 'Tu Empresa' }],
  creator: 'Tu Empresa',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'GestionaTuCondominio',
    description: 'Sistema completo de gestión y administración de condominios',
    siteName: 'GestionaTuCondominio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GestionaTuCondominio',
    description: 'Sistema completo de gestión y administración de condominios',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
