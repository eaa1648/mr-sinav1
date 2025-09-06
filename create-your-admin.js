const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createYourAdmin() {
  try {
    console.log('Creating/updating admin user with your specifications...');
    
    // Hash the password "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Get the first hospital (or create one if needed)
    let hospital = await prisma.hastaneler.findUnique({
      where: { hastane_id: "123456" }
    });
    
    if (!hospital) {
      // If hospital with ID 123456 doesn't exist, let's use the first available hospital
      const hospitals = await prisma.hastaneler.findMany();
      if (hospitals.length > 0) {
        hospital = hospitals[0];
        console.log(`Using existing hospital: ${hospital.hastane_adi} (ID: ${hospital.hastane_id})`);
      } else {
        console.log('No hospitals found, this is unexpected');
        return;
      }
    } else {
      console.log(`Using hospital with ID 123456: ${hospital.hastane_adi}`);
    }
    
    // Create or update the admin user with your specifications
    const adminUser = await prisma.kullanicilar.upsert({
      where: { tc_kimlik_no: "12345678912" },
      update: {
        ad: "Admin",
        soyad: "User",
        uzmanlik_alani: "System Administration",
        hastane_id: hospital.hastane_id,
        rol: "ADMIN",
        sifre: hashedPassword
      },
      create: {
        tc_kimlik_no: "12345678912",
        ad: "Admin",
        soyad: "User",
        uzmanlik_alani: "System Administration",
        hastane_id: hospital.hastane_id,
        rol: "ADMIN",
        sifre: hashedPassword
      }
    });
    
    console.log('Admin user successfully created/updated!');
    console.log('Login credentials:');
    console.log('- TC Kimlik No: 12345678912');
    console.log('- Password: 123456');
    console.log('- Hospital ID: ' + hospital.hastane_id);
    console.log('- Role: ADMIN');
    
    // Also list all users to confirm
    console.log('\nCurrent users in database:');
    const users = await prisma.kullanicilar.findMany({
      select: {
        tc_kimlik_no: true,
        ad: true,
        soyad: true,
        rol: true
      }
    });
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.ad} ${user.soyad} (${user.rol}) - TC: ${user.tc_kimlik_no}`);
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createYourAdmin();