const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('Checking for admin user with TC: 12345678912');
    
    // Check if user exists
    const user = await prisma.kullanicilar.findUnique({
      where: { tc_kimlik_no: "12345678912" }
    });
    
    if (user) {
      console.log('User found:');
      console.log('- TC:', user.tc_kimlik_no);
      console.log('- Name:', user.ad, user.soyad);
      console.log('- Role:', user.rol);
      console.log('- Hospital ID:', user.hastane_id);
      console.log('- Password hash starts with:', user.sifre.substring(0, 20) + '...');
    } else {
      console.log('No user found with TC: 12345678912');
    }
    
    // Check if hospital exists
    console.log('\nChecking for hospital with ID: 123456');
    const hospital = await prisma.hastaneler.findUnique({
      where: { hastane_id: "123456" }
    });
    
    if (hospital) {
      console.log('Hospital found:');
      console.log('- ID:', hospital.hastane_id);
      console.log('- Name:', hospital.hastane_adi);
    } else {
      console.log('No hospital found with ID: 123456');
    }
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();