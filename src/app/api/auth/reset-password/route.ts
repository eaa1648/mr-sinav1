import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ 
        error: 'Eksik parametreler' 
      }, { status: 400 })
    }

    // Find users and check for valid reset token in password field
    // This is a temporary approach until we can add proper password reset tables
    const users = await prisma.kullanicilar.findMany({
      where: {
        sifre: {
          startsWith: 'RESET_TOKEN:'
        }
      }
    })

    let userWithValidToken = null
    let originalPassword = null

    // Check each user for a matching valid token
    for (const user of users) {
      const passwordParts = user.sifre.split(':')
      if (passwordParts.length >= 4 && passwordParts[1] === token) {
        const tokenExpiry = parseInt(passwordParts[2])
        if (Date.now() < tokenExpiry) {
          userWithValidToken = user
          originalPassword = passwordParts.slice(3).join(':')
          break
        }
      }
    }

    if (!userWithValidToken) {
      return NextResponse.json({ 
        error: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı' 
      }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update the user's password and remove the reset token
    await prisma.kullanicilar.update({
      where: {
        kullanici_id: userWithValidToken.kullanici_id
      },
      data: {
        sifre: hashedPassword
      }
    })

    return NextResponse.json({
      message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
      success: true
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ 
      error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' 
    }, { status: 500 })
  }
}