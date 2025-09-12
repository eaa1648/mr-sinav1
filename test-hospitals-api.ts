import { prisma } from './src/lib/prisma'

async function testHospitalsApi() {
  try {
    console.log('Testing hospitals API...')
    const hospitals = await prisma.hastaneler.findMany({
      orderBy: { sehir: 'asc' }
    })
    console.log('Hospitals API test successful!')
    console.log('Found hospitals:', hospitals.length)
    console.log('First hospital:', hospitals[0])
  } catch (error) {
    console.error('Hospitals API test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testHospitalsApi()