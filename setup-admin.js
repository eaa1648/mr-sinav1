const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    console.log('Setting up admin user with your specifications...');
    
    // Hash the password "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Try to find existing hospital or create one
    let hospital;
    try {
      hospital = await prisma.hastaneler.findUnique({
        where: { hastane_id: "123456" }
      });
      
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
        });
        console.log('Created hospital with ID 123456');
      } else {
        console.log('Using existing hospital with ID 123456');
      }
    } catch (error) {
      console.log('Could not create/find hospital, proceeding with user creation...');
    }
    
    // Create or update admin user
    const adminUser = await prisma.kullanicilar.upsert({
      where: { tc_kimlik_no: "12345678912" },
      update: {
        ad: "Admin",
        soyad: "User",
        uzmanlik_alani: "System Administration",
        hastane_id: "123456",
        rol: "ADMIN",
        sifre: hashedPassword
      },
      create: {
        tc_kimlik_no: "12345678912",
        ad: "Admin",
        soyad: "User",
        uzmanlik_alani: "System Administration",
        hastane_id: "123456",
        rol: "ADMIN",
        sifre: hashedPassword
      }
    });
    
    console.log('Admin user setup complete!');
    console.log('Login credentials:');
    console.log('- TC Kimlik No: 12345678912');
    console.log('- Password: 123456');
    console.log('- Hospital ID: 123456');
    console.log('- Role: ADMIN');
    
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();