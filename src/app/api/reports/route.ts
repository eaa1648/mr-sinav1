import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { calculateGafScore } from '@/lib/gafScoring'
import { RaporStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || undefined)
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
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where = payload.role === 'ADMIN' 
      ? (status ? { 
          durum: status === 'pending' 
            ? { in: [RaporStatus.TASLAK, RaporStatus.INCELEME] } 
            : RaporStatus[status.toUpperCase() as keyof typeof RaporStatus]
        } : {})
      : (status ? { 
          olusturan_kullanici_id: payload.userId, 
          durum: status === 'pending' 
            ? { in: [RaporStatus.TASLAK, RaporStatus.INCELEME] } 
            : RaporStatus[status.toUpperCase() as keyof typeof RaporStatus]
        } : { olusturan_kullanici_id: payload.userId })

    const [reports, total] = await Promise.all([
      prisma.raporlar.findMany({
        where,
        include: {
          hasta: {
            select: {
              ad: true,
              soyad: true,
              tc_kimlik_no: true
            }
          },
          olusturan_kullanici: {
            select: {
              ad: true,
              soyad: true,
              uzmanlik_alani: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { olusturma_tarihi: 'desc' }
      }),
      prisma.raporlar.count({ where })
    ])

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
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

    const data = await request.json()
    const { 
      hasta_id, 
      mr_id_1,
      mr_id_2,
      yapay_zeka_yorumu, 
      optimizasyon_sonucu, 
      doktor_gorusleri, 
      gaf_uyum_skoru,
      baslik,
      autoCalculateGaf = false
    } = data

    if (!hasta_id) {
      return NextResponse.json({ error: 'Hasta ID gerekli' }, { status: 400 })
    }

    // Check if patient exists and user has access
    const patient = await prisma.hastalar.findUnique({
      where: { hasta_id },
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
        return NextResponse.json({ error: 'Bu hasta için rapor oluşturma yetkiniz yok' }, { status: 403 })
      }
    }

    // Auto-calculate GAF score if requested
    let calculatedGafScore = gaf_uyum_skoru;
    if (autoCalculateGaf && !gaf_uyum_skoru) {
      // Fetch clinical scale data for this patient
      const clinicalScales = await prisma.klinik_Olcek_Puanlari.findMany({
        where: { hasta_id },
        orderBy: { degerlendirme_tarihi: 'desc' },
        take: 10 // Get last 10 scale entries
      });

      // Convert to format expected by GAF calculator
      const scaleData = clinicalScales.map(scale => ({
        scaleName: scale.olcek_adi,
        score: scale.puan,
        maxScore: scale.max_puan || undefined,
        date: scale.degerlendirme_tarihi
      }));

      // Calculate GAF score
      const gafResult = calculateGafScore(scaleData);
      calculatedGafScore = gafResult.score;
    }

    const report = await prisma.raporlar.create({
      data: {
        hasta_id,
        olusturan_kullanici_id: payload.userId,
        mr_id_1,
        mr_id_2,
        yapay_zeka_yorumu,
        optimizasyon_sonucu,
        doktor_gorusleri,
        gaf_uyum_skoru: calculatedGafScore ? parseFloat(calculatedGafScore.toString()) : null,
        durum: RaporStatus.TASLAK
      },
      include: {
        hasta: {
          select: {
            ad: true,
            soyad: true,
            tc_kimlik_no: true
          }
        },
        olusturan_kullanici: {
          select: {
            ad: true,
            soyad: true,
            uzmanlik_alani: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Rapor başarıyla oluşturuldu',
      report
    }, { status: 201 })

  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}