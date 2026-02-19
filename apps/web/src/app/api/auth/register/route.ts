import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@condominios/database'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { rateLimit } from '@/lib/redis'
import { logger } from '@/lib/logger'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50).trim(),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50).trim(),
  email: z.string().email('Correo electrónico inválido').transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe incluir mayúscula, minúscula y número'
    ),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per minute per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { success: rateLimitOk } = await rateLimit(`register:${ip}`, 5, 60000)
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en un minuto.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, lastName, email, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        lastName,
        email,
        password: hashedPassword,
        role: 'RESIDENTE',
      },
    })

    logger.info({ userId: user.id }, 'New user registered')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Datos inválidos' },
        { status: 400 }
      )
    }
    logger.error({ err: error instanceof Error ? error.message : String(error) }, 'Registration error')
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
