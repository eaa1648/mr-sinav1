import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdminUser() {
  try {
    console.log('Checking for existing admin users...')
    
    // Check if admin user already exists
    const adminUsers = await prisma.kullanicilar.findMany({
      where: {
        rol: 'ADMIN'
      }
    })

    if (adminUsers.length > 0) {
      console.log('Found existing admin users:')
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. Name: ${admin.ad} ${admin.soyad}`)
        console.log(`   TC: ${admin.tc_kimlik_no}`)
        console.log(`   Hospital ID: ${admin.hastane_id}`)
      })
    } else {
      console.log('No admin users found in the database.')
    }

    // Check all users and their roles
    const allUsers = await prisma.kullanicilar.findMany({
      select: {
        ad: true,
        soyad: true,
        tc_kimlik_no: true,
        rol: true,
        hastane_id: true
      }
    })

    console.log('\nAll users in the database:')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.ad} ${user.soyad} (${user.rol}) - TC: ${user.tc_kimlik_no}`)
    })

  } catch (error) {
    console.error('Error checking admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUser()