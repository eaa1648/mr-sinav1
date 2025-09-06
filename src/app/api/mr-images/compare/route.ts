import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { compareMRImages } from '@/lib/pythonService'

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

    const { mrId1, mrId2 } = await request.json()

    if (!mrId1 || !mrId2) {
      return NextResponse.json({ error: 'İki MR ID de gerekli' }, { status: 400 })
    }

    // Fetch MR image details
    const [mr1, mr2] = await Promise.all([
      prisma.mR_Goruntuleri.findUnique({
        where: { mr_id: mrId1 }
      }),
      prisma.mR_Goruntuleri.findUnique({
        where: { mr_id: mrId2 }
      })
    ])

    if (!mr1 || !mr2) {
      return NextResponse.json({ error: 'MR görüntüleri bulunamadı' }, { status: 404 })
    }

    // Check if both MRs belong to the same patient
    if (mr1.hasta_id !== mr2.hasta_id) {
      return NextResponse.json({ error: 'MR görüntüleri aynı hastaya ait olmalıdır' }, { status: 400 })
    }

    // Check patient access
    const patient = await prisma.hastalar.findUnique({
      where: { hasta_id: mr1.hasta_id },
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
        return NextResponse.json({ error: 'Bu hastanın MR görüntülerini karşılaştırma yetkiniz yok' }, { status: 403 })
      }
    }

    // Call Python service for MR comparison
    const comparisonResult = await compareMRImages(
      mr1.orijinal_dosya_yolu,
      mr2.orijinal_dosya_yolu,
      mr1.hasta_id
    )

    // Save comparison result to database
    const comparisonRecord = await prisma.raporlar.create({
      data: {
        hasta_id: mr1.hasta_id,
        olusturan_kullanici_id: payload.userId,
        mr_id_1: mrId1,
        mr_id_2: mrId2,
        yapay_zeka_yorumu: comparisonResult.aiInterpretation || 'AI analizi tamamlandı',
        optimizasyon_sonucu: comparisonResult.recommendation || {},
        gaf_uyum_skoru: comparisonResult.gafScore || null,
        durum: 'TASLAK'
      }
    })

    return NextResponse.json({
      message: 'MR karşılaştırması başarıyla tamamlandı',
      comparisonResult,
      reportId: comparisonRecord.rapor_id
    }, { status: 200 })

  } catch (error: any) {
    console.error('MR comparison error:', error)
    
    // Handle specific error cases
    if (error.message && error.message.includes('Python service error')) {
      return NextResponse.json({ 
        error: 'MR işleme servisine erişim hatası', 
        details: error.message 
      }, { status: 503 })
    }
    
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}