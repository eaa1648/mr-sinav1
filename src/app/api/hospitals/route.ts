import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Hospital list should be publicly accessible
    console.log('Fetching hospitals from database...')
    const hospitals = await prisma.hastaneler.findMany({
      orderBy: { sehir: 'asc' }
    })
    console.log(`Found ${hospitals.length} hospitals`)

    return NextResponse.json({ hospitals })

  } catch (error: any) {
    console.error('Get hospitals error:', error)
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message || 'Bilinmeyen hata' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || undefined)
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    // Only admins can create hospitals
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
    }

    const data = await request.json()

    const hospital = await prisma.hastaneler.create({
      data: {
        hastane_adi: data.hastane_adi,
        sehir: data.sehir,
        adres: data.adres,
        telefon: data.telefon,
        email: data.email,
        website: data.website,
        aktif_doktor_sayisi: data.aktif_doktor_sayisi || 0,
        aktif_hasta_sayisi: data.aktif_hasta_sayisi || 0,
        koordinat_x: data.koordinat_x,
        koordinat_y: data.koordinat_y
      }
    })

    return NextResponse.json({ hospital })

  } catch (error: any) {
    console.error('Create hospital error:', error)
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message || 'Bilinmeyen hata' }, { status: 500 })
  }
}