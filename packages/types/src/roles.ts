export type { Role } from '@condominios/database'

export type UserRole = 'SUPER_ADMIN' | 'ADMIN_CONDOMINIO' | 'ADMIN_FINANZAS' | 'PORTERO' | 'RESIDENTE' | 'PROPIETARIO' | 'INQUILINO'

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN_CONDOMINIO: 'Administrador de Condominio',
  ADMIN_FINANZAS: 'Administrador Financiero',
  PORTERO: 'Portero',
  RESIDENTE: 'Residente',
  PROPIETARIO: 'Propietario',
  INQUILINO: 'Inquilino',
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['all'],
  ADMIN_CONDOMINIO: [
    'condominium:read',
    'condominium:write',
    'units:read',
    'units:write',
    'users:read',
    'users:write',
    'payments:read',
    'payments:write',
    'expenses:read',
    'expenses:write',
    'announcements:read',
    'announcements:write',
    'reservations:read',
    'reservations:write',
    'access:read',
    'access:write',
  ],
  ADMIN_FINANZAS: [
    'payments:read',
    'payments:write',
    'expenses:read',
    'expenses:write',
    'reports:read',
  ],
  PORTERO: [
    'access:read',
    'access:write',
    'reservations:read',
  ],
  RESIDENTE: [
    'units:read',
    'payments:read',
    'reservations:read',
    'reservations:write',
    'announcements:read',
    'access:read',
  ],
  PROPIETARIO: [
    'units:read',
    'payments:read',
    'payments:write',
    'reservations:read',
    'reservations:write',
    'announcements:read',
    'access:read',
  ],
  INQUILINO: [
    'units:read',
    'payments:read',
    'reservations:read',
    'reservations:write',
    'announcements:read',
    'access:read',
  ],
}
