import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../../../.env') })

import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@condominios.com' },
    update: {},
    create: {
      email: 'admin@condominios.com',
      password: hashedPassword,
      name: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
      isActive: true,
    },
  })

  console.log('✅ Super Admin creado:', superAdmin.email)

  const condominio = await prisma.condominium.upsert({
    where: { slug: 'residencial-lomas' },
    update: {},
    create: {
      name: 'Residencial Las Lomas',
      slug: 'residencial-lomas',
      address: 'Av. Principal 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06600',
      phone: '5551234567',
      email: 'contacto@residenciallomas.com',
      description: 'Condominio de lujo con excelentes amenidades',
      totalUnits: 50,
      ownerId: superAdmin.id,
      settings: {
        currency: 'MXN',
        lateFeePercentage: 5,
        gracePeriodDays: 5,
      },
    },
  })

  console.log('✅ Condominio creado:', condominio.name)

  const edificio = await prisma.building.create({
    data: {
      condominiumId: condominio.id,
      name: 'Torre A',
      floors: 5,
      unitsPerFloor: 4,
      hasElevator: true,
      hasParking: true,
    },
  })

  console.log('✅ Edificio creado:', edificio.name)

  const units = []
  for (let floor = 1; floor <= 5; floor++) {
    for (let unit = 1; unit <= 4; unit++) {
      const unitNumber = `${floor}${unit.toString().padStart(2, '0')}`
      units.push({
        condominiumId: condominio.id,
        buildingId: edificio.id,
        unitNumber: `A-${unitNumber}`,
        floor,
        area: 80 + (floor * 5),
        bedrooms: 2,
        bathrooms: 2,
        parkingSpots: 1,
        ownershipPercentage: 2,
      })
    }
  }

  const createdUnits = await prisma.unit.createMany({
    data: units,
    skipDuplicates: true,
  })

  console.log(`✅ ${createdUnits.count} unidades creadas`)

  const areasComunes = await prisma.commonArea.createMany({
    data: [
      {
        condominiumId: condominio.id,
        name: 'Alberca',
        description: 'Alberca semi-olímpica con área de solárium',
        capacity: 30,
        hourlyRate: 0,
        schedule: { open: '06:00', close: '22:00' },
      },
      {
        condominiumId: condominio.id,
        name: 'Gimnasio',
        description: 'Gimnasio equipado con máquinas modernas',
        capacity: 20,
        hourlyRate: 0,
        schedule: { open: '05:00', close: '23:00' },
      },
      {
        condominiumId: condominio.id,
        name: 'Salón de Eventos',
        description: 'Salón para eventos y reuniones',
        capacity: 100,
        hourlyRate: 500,
        schedule: { open: '08:00', close: '02:00' },
      },
      {
        condominiumId: condominio.id,
        name: 'Cancha de Fútbol',
        description: 'Cancha de fútbol 7',
        capacity: 22,
        hourlyRate: 200,
        schedule: { open: '07:00', close: '22:00' },
      },
    ],
    skipDuplicates: true,
  })

  console.log(`✅ ${areasComunes.count} áreas comunes creadas`)

  const cuota = await prisma.fee.create({
    data: {
      condominiumId: condominio.id,
      name: 'Cuota de Mantenimiento Mensual',
      description: 'Cuota mensual para mantenimiento general del condominio',
      amount: 2500,
      dueDay: 5,
      isRecurring: true,
    },
  })

  console.log('✅ Cuota creada:', cuota.name)

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
