import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { tc_kimlik_no, hastane_id, sifre } = await request.json()

    if (!tc_kimlik_no || !hastane_id || !sifre) {
      return NextResponse.json(
        { error: 'T.C. Kimlik No, Hastane ID ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.kullanicilar.findFirst({
      where: {
        tc_kimlik_no,
        hastane_id
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(sifre, user.sifre)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Geçersiz şifre' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = signToken({
      userId: user.kullanici_id,
      tc_kimlik_no: user.tc_kimlik_no,
      role: user.rol
    })

    // Return user info without password
    const { sifre: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Giriş başarılı',
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}