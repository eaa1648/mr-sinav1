import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSpecificAdminUser() {
  try {
    console.log('Creating specific admin user...')
    
    // Check if a user with this TC already exists
    const existingUser = await prisma.kullanicilar.findUnique({
      where: {
        tc_kimlik_no: "12345678912"
      }
    })

    if (existingUser) {
      console.log('User with TC 12345678912 already exists:')
      console.log(`- Name: ${existingUser.ad} ${existingUser.soyad}`)
      console.log(`- Role: ${existingUser.rol}`)
      console.log(`- Hospital ID: ${existingUser.hastane_id}`)
      
      // If it's not an admin, we can update it
      if (existingUser.rol !== 'ADMIN') {
        const updatedUser = await prisma.kullanicilar.update({
          where: { tc_kimlik_no: "12345678912" },
          data: {
            rol: 'ADMIN',
            ad: 'Admin',
            soyad: 'User',
            uzmanlik_alani: 'System Administration'
          }
        })
        console.log('Updated user to ADMIN role')
      }
    } else {
      // Check if hospital with ID 123456 exists
      let hospital = await prisma.hastaneler.findUnique({
        where: {
          hastane_id: "123456"
        }
      })

      // If not, create the hospital
      if (!hospital) {
        hospital = await prisma.hastaneler.create({
          data: {
            hastane_id: "123456",
            hastane_adi: "Admin Hospital",
            sehir: "İstanbul",
            adres: "Admin Address",
            telefon: "+90 212 123 45 67",
            email: "admin@hospital.com",
            website: "https://adminhospital.com",
            aktif_doktor_sayisi: 0,
            aktif_hasta_sayisi: 0
          }
        })
        console.log('Created hospital with ID 123456')
      }

      // Hash the password "123456"
      const hashedPassword = await bcrypt.hash('123456', 10)

      // Create admin user
      const adminUser = await prisma.kullanicilar.create({
        data: {
          kullanici_id: "admin-user-id", // Prisma will generate this if not provided
          tc_kimlik_no: "12345678912",
          ad: "Admin",
          soyad: "User",
          uzmanlik_alani: "System Administration",
          hastane_id: "123456",
          rol: "ADMIN",
          sifre: hashedPassword
        }
      })

      console.log('Admin user created successfully!')
      console.log(`- Name: ${adminUser.ad} ${adminUser.soyad}`)
      console.log(`- TC: ${adminUser.tc_kimlik_no}`)
      console.log(`- Hospital ID: ${adminUser.hastane_id}`)
      console.log('- Password: 123456')
    }
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSpecificAdminUser()