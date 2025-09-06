import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { clinicalDecisionSupport } from '@/lib/optimizationModel'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || undefined)
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    const patientId = params.id
    const { timeHorizon = 90, objective = 'minimize_symptoms' } = await request.json()

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

    // Fetch patient clinical data
    const [clinicalScores, medications, mrImages] = await Promise.all([
      prisma.klinik_Olcek_Puanlari.findMany({
        where: { hasta_id: patientId },
        orderBy: { degerlendirme_tarihi: 'asc' }
      }),
      prisma.ilac_Tedavileri.findMany({
        where: { hasta_id: patientId },
        orderBy: { baslangic_tarihi: 'asc' }
      }),
      prisma.mR_Goruntuleri.findMany({
        where: { hasta_id: patientId },
        orderBy: { cekilis_tarihi: 'asc' }
      })
    ])

    // Prepare patient history for optimization model
    const patientHistory = {
      clinicalData: clinicalScores.map(score => ({
        date: score.degerlendirme_tarihi,
        scaleName: score.olcek_adi,
        score: score.puan,
        maxScore: score.max_puan || undefined
      })),
      treatments: medications.map(med => ({
        medication: med.ilac_adi,
        dosage: med.dozaj,
        startDate: med.baslangic_tarihi,
        endDate: med.bitis_tarihi || undefined
      })),
      mrImages: mrImages.map(mr => ({
        date: mr.cekilis_tarihi,
        path: mr.orijinal_dosya_yolu,
        analysis: mr.islenmis_veri_yolu ? { processed: true } : undefined
      }))
    }

    // Define optimization parameters
    const parameters = {
      timeHorizon,
      objective,
      constraints: {
        maxMedicationChanges: 2,
        minTreatmentDuration: 30,
        maxDosage: 100
      }
    }

    // Run optimization analysis
    const optimizationResult = clinicalDecisionSupport.analyzePatient(patientHistory, parameters)

    // Save optimization result to database
    const optimizationRecord = await prisma.raporlar.create({
      data: {
        hasta_id: patientId,
        olusturan_kullanici_id: payload.userId,
        optimizasyon_sonucu: optimizationResult as any, // Type cast to bypass Prisma JSON type checking
        durum: 'TASLAK'
      }
    })

    return NextResponse.json({
      message: 'Optimizasyon analizi başarıyla tamamlandı',
      optimizationResult,
      reportId: optimizationRecord.rapor_id
    }, { status: 200 })

  } catch (error) {
    console.error('Optimization error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}