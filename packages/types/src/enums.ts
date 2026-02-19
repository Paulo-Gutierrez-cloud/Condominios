import { z } from 'zod'

export const paymentStatusSchema = z.enum([
  'PENDIENTE',
  'PAGADO',
  'VENCIDO',
  'PARCIAL',
  'CANCELADO',
])

export const paymentMethodSchema = z.enum([
  'TRANSFERENCIA',
  'DEPOSITO',
  'EFECTIVO',
  'TARJETA',
  'MERCADOPAGO',
  'STRIPE',
])

export const expenseCategorySchema = z.enum([
  'MANTENIMIENTO',
  'SERVICIOS',
  'SEGURIDAD',
  'LIMPIEZA',
  'AREAS_COMUNES',
  'ADMINISTRACION',
  'REPARACIONES',
  'OTROS',
])

export const reservationStatusSchema = z.enum([
  'PENDIENTE',
  'APROBADA',
  'RECHAZADA',
  'CANCELADA',
  'COMPLETADA',
])

export const accessTypeSchema = z.enum([
  'ENTRADA',
  'SALIDA',
  'VISITA',
  'DELIVERY',
  'SERVICIO',
])

export const unitTypeSchema = z.enum([
  'DEPARTAMENTO',
  'CASA',
  'LOCAL_COMERCIAL',
  'OFICINA',
  'ESTACIONAMIENTO',
  'BODEGA',
])

export type PaymentStatus = z.infer<typeof paymentStatusSchema>
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>
export type ReservationStatus = z.infer<typeof reservationStatusSchema>
export type AccessType = z.infer<typeof accessTypeSchema>
export type UnitType = z.infer<typeof unitTypeSchema>
