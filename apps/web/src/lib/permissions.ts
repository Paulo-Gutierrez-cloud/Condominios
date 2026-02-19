import { Role } from '@condominios/database'

export type Permission =
    | 'manage_condominiums'
    | 'manage_residents'
    | 'manage_payments'
    | 'view_all_payments'
    | 'manage_reservations'
    | 'manage_announcements'
    | 'view_reports'
    | 'manage_settings'
    | 'view_personal_payments'
    | 'view_personal_reservations'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    SUPER_ADMIN: [
        'manage_condominiums',
        'manage_residents',
        'manage_payments',
        'view_all_payments',
        'manage_reservations',
        'manage_announcements',
        'view_reports',
        'manage_settings'
    ],
    ADMIN_CONDOMINIO: [
        'manage_residents',
        'manage_payments',
        'view_all_payments',
        'manage_reservations',
        'manage_announcements',
        'view_reports'
    ],
    ADMIN_FINANZAS: [
        'manage_payments',
        'view_all_payments',
        'view_reports'
    ],
    PORTERO: [
        'manage_reservations' // Only to verify arrivals
    ],
    RESIDENTE: [
        'view_personal_payments',
        'view_personal_reservations'
    ],
    PROPIETARIO: [
        'view_personal_payments',
        'view_personal_reservations'
    ],
    INQUILINO: [
        'view_personal_payments',
        'view_personal_reservations'
    ]
}

export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function canAccessRoute(role: Role, path: string): boolean {
    if (role === 'SUPER_ADMIN') return true

    if (path.startsWith('/dashboard/condominios')) {
        return hasPermission(role, 'manage_condominiums')
    }
    if (path.startsWith('/dashboard/residentes')) {
        return hasPermission(role, 'manage_residents')
    }
    if (path.startsWith('/dashboard/reportes')) {
        return hasPermission(role, 'view_reports')
    }

    // Common routes
    return true
}
