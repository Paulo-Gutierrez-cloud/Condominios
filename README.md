# GestionaTuCondominio - SaaS de Gestión de Condominios

Sistema completo para la gestión y administración de condominios. Control de pagos, residentes, áreas comunes, gastos y más en una sola plataforma.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| **Frontend** | Next.js 14 (App Router) |
| **Backend** | Next.js API Routes |
| **Base de datos** | PostgreSQL |
| **ORM** | Prisma |
| **Autenticación** | Auth.js (NextAuth) |
| **UI** | Shadcn/ui + Tailwind CSS |
| **Cache** | Redis |
| **Storage** | MinIO (S3-compatible) |
| **Testing** | Vitest + Playwright |
| **CI/CD** | GitHub Actions |

## Requisitos

- Node.js 20+
- Docker Desktop
- npm o pnpm

## Inicio Rápido

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd condominios-saas
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

### 3. Levantar servicios (PostgreSQL, Redis, MinIO)

```bash
npm run docker:up
```

### 4. Configurar base de datos

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Iniciar desarrollo

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:3000

## Credenciales de prueba

- **Email:** admin@condominios.com
- **Password:** admin123

## Estructura del Proyecto

```
condominios-saas/
├── apps/
│   └── web/                    # Aplicación Next.js
│       ├── src/
│       │   ├── app/            # Rutas (App Router)
│       │   ├── components/     # Componentes React
│       │   ├── lib/            # Utilidades y configuración
│       │   └── tests/          # Tests unitarios
│       └── e2e/                # Tests E2E
├── packages/
│   ├── database/               # Prisma + esquemas
│   ├── types/                  # Tipos TypeScript compartidos
│   └── utils/                  # Utilidades compartidas
├── docker/                     # Docker Compose
└── .github/
    └── workflows/              # CI/CD
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación |
| `npm run start` | Inicia la aplicación en producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica tipos de TypeScript |
| `npm run test` | Ejecuta tests unitarios |
| `npm run test:e2e` | Ejecuta tests E2E |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run docker:up` | Levanta servicios Docker |
| `npm run docker:down` | Detiene servicios Docker |

## Servicios de Desarrollo

| Servicio | Puerto | URL |
|----------|--------|-----|
| Aplicación | 3000 | http://localhost:3000 |
| Prisma Studio | 5555 | `npm run db:studio` |
| Adminer (DB) | 8080 | http://localhost:8080 |
| MinIO Console | 9001 | http://localhost:9001 |

## Módulos del Sistema

- **Dashboard**: Panel principal con métricas
- **Condominios**: Gestión de condominios y edificios
- **Residentes**: Administración de residentes y unidades
- **Pagos**: Control de cuotas y pagos
- **Reservaciones**: Reserva de áreas comunes
- **Avisos**: Comunicación con residentes
- **Reportes**: Reportes financieros
- **Configuración**: Ajustes del sistema

## Seguridad

- Autenticación con Auth.js
- Autorización basada en roles (RBAC)
- Validación de datos con Zod
- Protección CSRF
- Headers de seguridad configurados
- Rate limiting con Redis
- Logs de auditoría

## Despliegue a Producción

### Opción 1: VPS Self-Hosted

1. Configurar servidor con Docker
2. Configurar variables de entorno en secrets de GitHub
3. Push a main dispara el deploy automático

### Variables requeridas en GitHub Secrets

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Licencia

Privado - Todos los derechos reservados
