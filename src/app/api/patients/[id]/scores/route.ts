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

    const { searchParams } = new URL(request.url)
    const scaleType = searchParams.get('scale')

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

    const where = {
      hasta_id: patientId,
      ...(scaleType && { olcek_adi: scaleType })
    }

    const scores = await prisma.klinik_Olcek_Puanlari.findMany({
      where,
      include: {
        giren_kullanici: {
          select: {
            ad: true,
            soyad: true
          }
        }
      },
      orderBy: { degerlendirme_tarihi: 'desc' }
    })

    return NextResponse.json({ scores })

  } catch (error) {
    console.error('Get clinical scores error:', error)
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
    const { olcek_adi, puan, max_puan, degerlendirme_tarihi, notlar } = data

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
        return NextResponse.json({ error: 'Bu hastaya ölçek puanı ekleme yetkiniz yok' }, { status: 403 })
      }
    }

    const score = await prisma.klinik_Olcek_Puanlari.create({
      data: {
        hasta_id: patientId,
        olcek_adi,
        puan: parseFloat(puan),
        max_puan: max_puan ? parseFloat(max_puan) : null,
        degerlendirme_tarihi: new Date(degerlendirme_tarihi),
        giren_kullanici_id: payload.userId,
        notlar
      },
      include: {
        giren_kullanici: {
          select: {
            ad: true,
            soyad: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Ölçek puanı başarıyla eklendi',
      score
    }, { status: 201 })

  } catch (error) {
    console.error('Create clinical score error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}