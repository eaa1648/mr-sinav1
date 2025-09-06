import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.kullanicilar.findFirst({
      where: {
        rol: 'ADMIN'
      }
    })

    if (existingAdmin) {
      console.log('Admin user already exists:')
      console.log(`- Name: ${existingAdmin.ad} ${existingAdmin.soyad}`)
      console.log(`- TC: ${existingAdmin.tc_kimlik_no}`)
      console.log(`- Hospital ID: ${existingAdmin.hastane_id}`)
      console.log('Use password "password123" to login')
      return
    }

    // Check if there are any hospitals
    const hospitals = await prisma.hastaneler.findMany()
    let hospitalId: string

    if (hospitals.length > 0) {
      hospitalId = hospitals[0].hastane_id
      console.log(`Using existing hospital: ${hospitals[0].hastane_adi}`)
    } else {
      // Create a default hospital if none exists
      const hospital = await prisma.hastaneler.create({
        data: {
          hastane_adi: "Default Hospital",
          sehir: "İstanbul",
          adres: "Default Address",
          telefon: "+90 212 123 45 67",
          email: "admin@defaulthospital.com",
          website: "https://defaulthospital.com",
          aktif_doktor_sayisi: 0,
          aktif_hasta_sayisi: 0
        }
      })
      hospitalId = hospital.hastane_id
      console.log(`Created default hospital: ${hospital.hastane_adi}`)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create admin user
    const adminUser = await prisma.kullanicilar.create({
      data: {
        tc_kimlik_no: "99999999999",
        ad: "System",
        soyad: "Administrator",
        uzmanlik_alani: "System Administration",
        hastane_id: hospitalId,
        rol: "ADMIN",
        sifre: hashedPassword
      }
    })

    console.log('Admin user created successfully!')
    console.log(`- Name: ${adminUser.ad} ${adminUser.soyad}`)
    console.log(`- TC: ${adminUser.tc_kimlik_no}`)
    console.log(`- Hospital ID: ${adminUser.hastane_id}`)
    console.log('Use password "password123" to login')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()