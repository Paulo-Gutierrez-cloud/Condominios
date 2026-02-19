import 'dotenv/config'
import { prisma } from './src/client'
import bcrypt from 'bcryptjs'

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@condominios.com' }
  })
  
  if (user && user.password) {
    console.log('Stored password hash:', user.password)
    
    const isValid = await bcrypt.compare('admin123', user.password)
    console.log('Password "admin123" valid:', isValid)
    
    // Create a new hash to compare
    const newHash = await bcrypt.hash('admin123', 10)
    console.log('New hash for comparison:', newHash)
    
    const isNewValid = await bcrypt.compare('admin123', newHash)
    console.log('New hash valid:', isNewValid)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
