import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined)
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    const patientId = params.id

    // Check patient access
    const patient = await prisma.hastalar.findUnique({
      where: { hasta_id: patientId },
      include: {
        hasta_kayitlari: {
          where: { aktif: true }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Hasta bulunamadı' }, { status: 404 })
    }

    if (payload.role !== 'ADMIN') {
      const hasAccess = patient.hasta_kayitlari.some(
        kayit => kayit.kullanici_id === payload.userId
      )
      if (!hasAccess) {
        return NextResponse.json({ error: 'Bu hastaya erişim yetkiniz yok' }, { status: 403 })
      }
    }

    const medications = await prisma.ilac_Tedavileri.findMany({
      where: { hasta_id: patientId },
      orderBy: { baslangic_tarihi: 'desc' }
    })

    return NextResponse.json({ medications })

  } catch (error) {
    console.error('Get medications error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined)
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    const patientId = params.id
    const data = await request.json()
    const { ilac_adi, dozaj, baslangic_tarihi, bitis_tarihi } = data

    // Check patient access
    const patient = await prisma.hastalar.findUnique({
      where: { hasta_id: patientId },
      include: {
        hasta_kayitlari: {
          where: { aktif: true }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Hasta bulunamadı' }, { status: 404 })
    }

    if (payload.role !== 'ADMIN') {
      const hasAccess = patient.hasta_kayitlari.some(
        kayit => kayit.kullanici_id === payload.userId
      )
      if (!hasAccess) {
        return NextResponse.json({ error: 'Bu hastaya ilaç ekleme yetkiniz yok' }, { status: 403 })
      }
    }

    const medication = await prisma.ilac_Tedavileri.create({
      data: {
        hasta_id: patientId,
        ilac_adi,
        dozaj,
        baslangic_tarihi: new Date(baslangic_tarihi),
        bitis_tarihi: bitis_tarihi ? new Date(bitis_tarihi) : null
      }
    })

    return NextResponse.json({
      message: 'İlaç tedavisi başarıyla eklendi',
      medication
    }, { status: 201 })

  } catch (error) {
    console.error('Create medication error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}