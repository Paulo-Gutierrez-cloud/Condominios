import 'dotenv/config'
import { prisma } from './src/client'

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@condominios.com' }
  })
  console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'NOT FOUND')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
