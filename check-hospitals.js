const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkHospitals() {
  try {
    const hospitals = await prisma.hastaneler.findMany();
    
    console.log('Hospitals in database:');
    console.log('=====================');
    
    hospitals.forEach((hospital, index) => {
      console.log(`${index + 1}. ${hospital.hastane_adi}`);
      console.log(`   ID: ${hospital.hastane_id}`);
      console.log(`   City: ${hospital.sehir}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHospitals();