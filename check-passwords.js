const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkPasswordHashing() {
  try {
    const users = await prisma.kullanicilar.findMany();
    
    console.log('Password Analysis:');
    console.log('==================');
    
    for (const user of users) {
      console.log(`\nUser: ${user.ad} ${user.soyad} (TC: ${user.tc_kimlik_no})`);
      console.log(`Password: ${user.sifre}`);
      
      // Check if password is hashed
      const isHashed = user.sifre.startsWith('$2a$') || user.sifre.startsWith('$2b$');
      console.log(`Is Properly Hashed: ${isHashed}`);
      
      if (isHashed) {
        // Test password verification
        const testResult = await bcrypt.compare('123456', user.sifre);
        console.log(`Verification Test (with '123456'): ${testResult}`);
      } else {
        console.log('WARNING: Password is stored as plain text!');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPasswordHashing();