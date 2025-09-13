const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin(tc_kimlik_no, hastane_id, password) {
  try {
    console.log(`Testing login for TC: ${tc_kimlik_no}, Hospital ID: ${hastane_id}`);
    
    // Find user
    const user = await prisma.kullanicilar.findFirst({
      where: {
        tc_kimlik_no,
        hastane_id
      }
    });

    if (!user) {
      console.log('ERROR: User not found');
      return;
    }

    console.log(`User found: ${user.ad} ${user.soyad}`);
    console.log(`Stored password hash: ${user.sifre}`);
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.sifre);
    console.log(`Password verification result: ${isValidPassword}`);
    
    if (!isValidPassword) {
      console.log('ERROR: Invalid password');
    } else {
      console.log('SUCCESS: Password is correct');
    }
  } catch (error) {
    console.error('Login test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Test with one of the users
// Replace these values with the ones you're using to login
testLogin('12345678901', 'cmf7badkc0000ggrw9v4u0q7v', '123456');