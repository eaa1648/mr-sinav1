import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token gerekli' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      )
    }

    const user = await prisma.kullanicilar.findUnique({
      where: { kullanici_id: payload.userId },
      select: {
        kullanici_id: true,
        tc_kimlik_no: true,
        ad: true,
        soyad: true,
        uzmanlik_alani: true,
        hastane_id: true,
        rol: true,
        created_at: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}