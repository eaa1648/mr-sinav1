const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function comprehensiveLoginTest() {
  try {
    console.log('=== COMPREHENSIVE LOGIN TROUBLESHOOTING ===\n');
    
    // 1. List all users
    const users = await prisma.kullanicilar.findMany();
    console.log('1. USERS IN DATABASE:');
    console.log('--------------------');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.ad} ${user.soyad}`);
      console.log(`   TC: ${user.tc_kimlik_no}`);
      console.log(`   Role: ${user.rol}`);
      console.log(`   Hospital ID: ${user.hastane_id}`);
      console.log(`   Password Hashed: ${user.sifre.startsWith('$2a$') || user.sifre.startsWith('$2b$')}`);
      console.log('');
    });
    
    // 2. List all hospitals
    const hospitals = await prisma.hastaneler.findMany();
    console.log('2. HOSPITALS IN DATABASE:');
    console.log('------------------------');
    hospitals.forEach((hospital, index) => {
      console.log(`${index + 1}. ${hospital.hastane_adi}`);
      console.log(`   ID: ${hospital.hastane_id}`);
      console.log(`   City: ${hospital.sehir}`);
      console.log('');
    });
    
    // 3. Test login combinations
    console.log('3. TESTING LOGIN COMBINATIONS:');
    console.log('-----------------------------');
    
    for (const user of users) {
      console.log(`\nTesting login for: ${user.ad} ${user.soyad} (TC: ${user.tc_kimlik_no})`);
      
      // Find the hospital for this user
      const hospital = hospitals.find(h => h.hastane_id === user.hastane_id);
      if (hospital) {
        console.log(`   Hospital: ${hospital.hastane_adi}`);
        
        // Test login
        const loginResult = await testLogin(user.tc_kimlik_no, user.hastane_id, '123456');
        console.log(`   Login Result: ${loginResult ? 'SUCCESS' : 'FAILED'}`);
      } else {
        console.log(`   WARNING: Hospital not found for this user!`);
      }
    }
    
    console.log('\n=== TROUBLESHOOTING COMPLETE ===');
    console.log('\nIf you are still having login issues, make sure you are using:');
    console.log('1. The exact TC number as shown above');
    console.log('2. The exact Hospital ID as shown above');
    console.log('3. The password "123456" for all test users');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testLogin(tc_kimlik_no, hastane_id, password) {
  try {
    // Find user
    const user = await prisma.kullanicilar.findFirst({
      where: {
        tc_kimlik_no,
        hastane_id
      }
    });

    if (!user) {
      return false;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.sifre);
    return isValidPassword;
  } catch (error) {
    console.error('Login test error:', error);
    return false;
  }
}

comprehensiveLoginTest();