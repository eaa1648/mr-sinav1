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

    const patient = await prisma.hastalar.findUnique({
      where: { hasta_id: patientId },
      include: {
        hasta_kayitlari: {
          where: { aktif: true },
          include: {
            modul: true,
            kullanici: {
              select: {
                ad: true,
                soyad: true,
                uzmanlik_alani: true
              }
            }
          }
        },
        mr_goruntuleri: {
          orderBy: { cekilis_tarihi: 'desc' }
        },
        klinik_puanlar: {
          orderBy: { degerlendirme_tarihi: 'desc' },
          include: {
            giren_kullanici: {
              select: {
                ad: true,
                soyad: true
              }
            }
          }
        },
        ilac_tedavileri: {
          where: { aktif: true },
          orderBy: { baslangic_tarihi: 'desc' }
        },
        raporlar: {
          orderBy: { olusturma_tarihi: 'desc' },
          include: {
            olusturan_kullanici: {
              select: {
                ad: true,
                soyad: true
              }
            }
          }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Hasta bulunamadı' }, { status: 404 })
    }

    // Check if user has access to this patient
    if (payload.role !== 'ADMIN') {
      const hasAccess = patient.hasta_kayitlari.some(
        kayit => kayit.kullanici_id === payload.userId
      )
      if (!hasAccess) {
        return NextResponse.json({ error: 'Bu hastaya erişim yetkiniz yok' }, { status: 403 })
      }
    }

    return NextResponse.json({ patient })

  } catch (error) {
    console.error('Get patient error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function PUT(
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

    // Check if patient exists and user has access
    const existingPatient = await prisma.hastalar.findUnique({
      where: { hasta_id: patientId },
      include: {
        hasta_kayitlari: {
          where: { aktif: true }
        }
      }
    })

    if (!existingPatient) {
      return NextResponse.json({ error: 'Hasta bulunamadı' }, { status: 404 })
    }

    if (payload.role !== 'ADMIN') {
      const hasAccess = existingPatient.hasta_kayitlari.some(
        kayit => kayit.kullanici_id === payload.userId
      )
      if (!hasAccess) {
        return NextResponse.json({ error: 'Bu hastayı güncelleme yetkiniz yok' }, { status: 403 })
      }
    }

    const updatedPatient = await prisma.hastalar.update({
      where: { hasta_id: patientId },
      data: {
        ad: data.ad,
        soyad: data.soyad,
        dogum_tarihi: data.dogum_tarihi ? new Date(data.dogum_tarihi) : null,
        cinsiyet: data.cinsiyet,
        telefon: data.telefon,
        adres: data.adres
      },
      include: {
        hasta_kayitlari: {
          where: { aktif: true },
          include: {
            modul: true,
            kullanici: {
              select: {
                ad: true,
                soyad: true,
                uzmanlik_alani: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Hasta bilgileri güncellendi',
      patient: updatedPatient
    })

  } catch (error) {
    console.error('Update patient error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}