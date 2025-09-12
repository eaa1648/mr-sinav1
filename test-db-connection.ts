import { prisma } from './src/lib/prisma'

async function testDbConnection() {
  try {
    console.log('Testing database connection...')
    const hospitals = await prisma.hastaneler.findMany({
      take: 5
    })
    console.log('Database connection successful!')
    console.log('Found hospitals:', hospitals.length)
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDbConnection()