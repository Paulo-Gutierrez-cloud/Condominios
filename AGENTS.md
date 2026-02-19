# AGENTS.md - Guía para Desarrollo

## Comandos importantes para este proyecto

### Desarrollo
```bash
npm run dev              # Inicia desarrollo (incluye Docker + DB)
npm run docker:up        # Levanta PostgreSQL, Redis, MinIO
npm run docker:down      # Detiene servicios Docker
```

### Base de datos
```bash
npm run db:generate      # Genera Prisma Client
npm run db:push          # Aplica esquema a la DB
npm run db:migrate       # Crea migración
npm run db:studio        # Abre Prisma Studio
npm run db:seed          # Pobla DB con datos de prueba
```

### Calidad de código
```bash
npm run lint             # Ejecuta ESLint
npm run typecheck        # Verifica tipos TypeScript
npm run test             # Tests unitarios (Vitest)
npm run test:e2e         # Tests E2E (Playwright)
```

### Build y producción
```bash
npm run build            # Compila la aplicación
npm run start            # Inicia en producción
```

## Estructura de módulos

Cada módulo de negocio sigue esta estructura:

```
src/modules/[modulo]/
├── actions.ts      # Server Actions
├── queries.ts      # Consultas a DB
├── schemas.ts      # Validación Zod
├── components/     # Componentes del módulo
└── types.ts        # Tipos TypeScript
```

## Convenciones

### Nombrado
- Componentes: PascalCase (ej: `UserProfile.tsx`)
- Funciones: camelCase (ej: `getUserById`)
- Constantes: SCREAMING_SNAKE_CASE (ej: `MAX_RETRIES`)

### Imports
```typescript
import { prisma } from '@condominios/database'
import { cn, formatCurrency } from '@condominios/utils'
import { Button } from '@/components/ui/button'
```

### Server Components vs Client Components
- Por defecto: Server Components
- Agregar `'use client'` solo cuando sea necesario (hooks, eventos)

## Roles del sistema

| Rol | Permisos |
|-----|----------|
| SUPER_ADMIN | Acceso total |
| ADMIN_CONDOMINIO | Gestión completa del condominio |
| ADMIN_FINANZAS | Pagos y gastos |
| PORTERO | Control de acceso |
| RESIDENTE | Solo lectura de sus datos |
| PROPIETARIO | Sus unidades y pagos |
| INQUILINO | Solo lectura |

## Antes de cada commit

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`

## Credenciales locales

- Admin: admin@condominios.com / admin123
- DB: condominios / condominios123
- Redis: redis123
- MinIO: minioadmin / minioadmin123
