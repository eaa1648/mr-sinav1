const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('Listing all users in the database:');
    
    // Get all users
    const users = await prisma.kullanicilar.findMany({
      select: {
        tc_kimlik_no: true,
        ad: true,
        soyad: true,
        rol: true,
        hastane_id: true
      }
    });
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.ad} ${user.soyad}`);
        console.log(`   TC: ${user.tc_kimlik_no}`);
        console.log(`   Role: ${user.rol}`);
        console.log(`   Hospital ID: ${user.hastane_id}`);
        console.log('');
      });
    }
    
    console.log('\nListing all hospitals:');
    const hospitals = await prisma.hastaneler.findMany({
      select: {
        hastane_id: true,
        hastane_adi: true
      }
    });
    
    if (hospitals.length === 0) {
      console.log('No hospitals found in the database.');
    } else {
      hospitals.forEach((hospital, index) => {
        console.log(`${index + 1}. ${hospital.hastane_adi}`);
        console.log(`   ID: ${hospital.hastane_id}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();