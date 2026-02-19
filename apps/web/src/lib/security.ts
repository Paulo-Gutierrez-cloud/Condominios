import { getServerSession } from 'next-auth'
import { prisma } from '@condominios/database'
import { authOptions } from './auth'
import { hasPermission as checkPermission, Permission } from './permissions'
import type { Role } from '@condominios/database'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      lastName: true,
      role: true,
      isActive: true,
      avatar: true,
    },
  })

  if (!user || !user.isActive) return null
  return user
}

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const role = session.user.role as Role

  if (allowedRoles && !allowedRoles.includes(role) && role !== 'SUPER_ADMIN') {
    throw new Error('Sin permisos para esta acción')
  }

  return {
    user: session.user,
    userId: session.user.id,
    role
  }
}

/**
 * Verifica que el usuario tenga acceso a un condominio específico.
 * - SUPER_ADMIN: Acceso total
 * - ADMIN_CONDOMINIO: Debe ser administrador o dueño del condominio
 * - RESIDENTE: Debe tener una unidad vinculada en ese condominio
 */
export async function verifyOwnership(condominiumId: string) {
  const { userId, role } = await requireAuth()

  if (role === 'SUPER_ADMIN') return true

  if (role === 'RESIDENTE') {
    const hasUnit = await prisma.userUnit.findFirst({
      where: {
        userId,
        unit: { condominiumId }
      }
    })
    if (!hasUnit) throw new Error('No tienes acceso a este condominio')
    return true
  }

  // Para roles administrativos (ADMIN_CONDOMINIO, ADMIN_FINANZAS, etc.)
  const condo = await prisma.condominium.findFirst({
    where: {
      id: condominiumId,
      OR: [
        { ownerId: userId },
        { admins: { some: { userId } } }
      ]
    }
  })

  if (!condo) throw new Error('No tienes permisos administrativos sobre este condominio')
  return true
}

/**
 * Verifica que una unidad pertenezca a un condominio al que el usuario tiene acceso.
 */
export async function verifyUnitOwnership(unitId: string) {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: { condominiumId: true }
  })

  if (!unit) throw new Error('Unidad no encontrada')

  return await verifyOwnership(unit.condominiumId)
}

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return checkPermission(userRole, permission)
}

export function requirePermission(userRole: Role, permission: Permission) {
  if (!hasPermission(userRole, permission)) {
    throw new Error('Sin permisos para esta acción')
  }
}

export function rateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`
}
