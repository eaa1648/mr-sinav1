import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      tc_kimlik_no,
      ad,
      soyad,
      uzmanlik_alani,
      hastane_id,
      hastane_adi,
      sifre,
      telefon,
      email,
      diploma_no,
      mezuniyet_tarihi
    } = data

    // Validate required fields
    if (!tc_kimlik_no || !ad || !soyad || !uzmanlik_alani || !hastane_id || !sifre) {
      return NextResponse.json({ 
        error: 'Gerekli alanlar eksik' 
      }, { status: 400 })
    }

    // Validate TC Kimlik No format (11 digits)
    if (!/^\d{11}$/.test(tc_kimlik_no)) {
      return NextResponse.json({ 
        error: 'T.C. Kimlik numarası 11 haneli olmalıdır' 
      }, { status: 400 })
    }

    // Validate password strength
    if (sifre.length < 6) {
      return NextResponse.json({ 
        error: 'Şifre en az 6 karakter olmalıdır' 
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.kullanicilar.findUnique({
      where: { tc_kimlik_no }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Bu T.C. Kimlik numarası ile kayıtlı kullanıcı zaten mevcut' 
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(sifre, 10)

    // Create pending registration
    const pendingRegistration = await prisma.bekleyen_Kayitlar.create({
      data: {
        tc_kimlik_no,
        ad,
        soyad,
        uzmanlik_alani,
        hastane_id,
        hastane_adi,
        sifre: hashedPassword,
        telefon,
        email,
        diploma_no,
        mezuniyet_tarihi: mezuniyet_tarihi ? new Date(mezuniyet_tarihi) : null,
        basvuru_tarihi: new Date(),
        durum: 'BEKLEMEDE'
      }
    })

    return NextResponse.json({
      message: 'Kayıt başvurunuz alındı. Yönetici onayından sonra sisteme giriş yapabileceksiniz.',
      registrationId: pendingRegistration.id
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ 
      error: 'Sunucu hatası' 
    }, { status: 500 })
  }
}