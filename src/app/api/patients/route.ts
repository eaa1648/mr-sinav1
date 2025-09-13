import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { createPatientUpdateNotification } from '@/lib/notifications'

export async function GET(request: NextRequest) {
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = payload.role === 'ADMIN' 
      ? {
          OR: search ? [
            { ad: { contains: search, mode: 'insensitive' as const } },
            { soyad: { contains: search, mode: 'insensitive' as const } },
            { tc_kimlik_no: { contains: search } }
          ] : undefined
        }
      : {
          hasta_kayitlari: {
            some: {
              kullanici_id: payload.userId,
              aktif: true
            }
          },
          OR: search ? [
            { ad: { contains: search, mode: 'insensitive' as const } },
            { soyad: { contains: search, mode: 'insensitive' as const } },
            { tc_kimlik_no: { contains: search } }
          ] : undefined
        }

    const [patients, total] = await Promise.all([
      prisma.hastalar.findMany({
        where,
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
          _count: {
            select: {
              mr_goruntuleri: true,
              klinik_puanlar: true,
              raporlar: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.hastalar.count({ where })
    ])

    return NextResponse.json({
      patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get patients error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined)
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    const data = await request.json()
    const { tc_kimlik_no, ad, soyad, dogum_tarihi, cinsiyet, telefon, adres, modul_id } = data

    // Check if patient already exists
    const existingPatient = await prisma.hastalar.findUnique({
      where: { tc_kimlik_no }
    })

    if (existingPatient) {
      return NextResponse.json({ error: 'Bu T.C. Kimlik No ile hasta zaten kayıtlı' }, { status: 400 })
    }

    // Create patient and assign to module
    const patient = await prisma.hastalar.create({
      data: {
        tc_kimlik_no,
        ad,
        soyad,
        dogum_tarihi: dogum_tarihi ? new Date(dogum_tarihi) : null,
        cinsiyet,
        telefon,
        adres,
        hasta_kayitlari: {
          create: {
            kullanici_id: payload.userId,
            modul_id
          }
        }
      },
      include: {
        hasta_kayitlari: {
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

    // Create notification for patient creation
    try {
      await createPatientUpdateNotification(
        payload.userId,
        `${patient.ad} ${patient.soyad}`,
        'hasta kaydı',
        `/dashboard/patients/${patient.hasta_id}`
      )
    } catch (notificationError) {
      console.error('Failed to create patient update notification:', notificationError)
    }

    return NextResponse.json({
      message: 'Hasta başarıyla eklendi',
      patient
    }, { status: 201 })

  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}