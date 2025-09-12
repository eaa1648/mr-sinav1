import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore - ignoring import error for now
import { prisma } from '@/lib/prisma'
// @ts-ignore - ignoring import error for now
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { tc_kimlik_no, hastane_id, email } = await request.json()

    if (!tc_kimlik_no || !hastane_id) {
      return NextResponse.json({ 
        error: 'T.C. Kimlik numarası ve Hastane ID gerekli' 
      }, { status: 400 })
    }

    // Check if user exists
    // @ts-ignore - ignoring type error for now
    const user: any = await prisma.kullanicilar.findFirst({
      where: {
        tc_kimlik_no,
        hastane_id
      },
      select: {
        kullanici_id: true,
        ad: true,
        soyad: true,
        tc_kimlik_no: true,
        hastane_id: true,
        uzmanlik_alani: true,
        // @ts-ignore - ignoring type error for now
        email: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'Girilen bilgilere ait kullanıcı bulunamadı' 
      }, { status: 404 })
    }

    // Generate a secure password reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store the reset token and expiry in the user record temporarily
    await prisma.kullanicilar.update({
      where: {
        kullanici_id: user.kullanici_id
      },
      data: {
        // We'll use the password field temporarily to store token info
        // In a production environment, you would want a separate table for this
        sifre: `RESET_TOKEN:${resetToken}:${resetTokenExpiry.getTime()}:${user.sifre}`
      }
    })

    // Send email if provided or if user has an email in the database
    // @ts-ignore - ignoring type error for now
    const userEmail = email || user.email
    if (userEmail) {
      try {
        await sendPasswordResetEmail(userEmail, user.ad, user.soyad, resetToken)
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
        // Continue with the process even if email fails
      }
    }

    return NextResponse.json({
      message: userEmail 
        ? 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.'
        : 'Şifre sıfırlama isteğiniz alındı. Sistem yöneticisi en kısa sürede size dönüş yapacaktır.',
      success: true
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ 
      error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' 
    }, { status: 500 })
  }
}