import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(
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

    const reportId = params.id

    // Fetch report data
    const report = await prisma.raporlar.findUnique({
      where: { rapor_id: reportId },
      include: {
        hasta: {
          select: {
            ad: true,
            soyad: true,
            tc_kimlik_no: true,
            dogum_tarihi: true,
            cinsiyet: true
          }
        },
        olusturan_kullanici: {
          select: {
            ad: true,
            soyad: true,
            uzmanlik_alani: true,
            hastane_id: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Rapor bulunamadı' }, { status: 404 })
    }

    // Check permissions
    if (payload.role !== 'ADMIN' && report.olusturan_kullanici_id !== payload.userId) {
      return NextResponse.json({ error: 'Bu raporu indirme yetkiniz yok' }, { status: 403 })
    }

    if (!report.rapor_dosya_yolu) {
      return NextResponse.json({ error: 'PDF henüz oluşturulmamış' }, { status: 404 })
    }

    // In a real implementation, you would:
    // 1. Read the actual PDF file from storage
    // 2. Return it as a blob/stream
    // For now, we'll generate a simple text-based report

    const reportContent = generateReportContent(report)
    
    // Create a simple text-based report as demonstration
    const response = new NextResponse(reportContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=\"rapor_${report.rapor_id}.pdf\"`,
        'Cache-Control': 'no-cache'
      }
    })

    return response

  } catch (error) {
    console.error('PDF download error:', error)
    return NextResponse.json({ error: 'PDF indirme hatası' }, { status: 500 })
  }
}

function generateReportContent(report: any): string {
  const currentDate = new Date().toLocaleDateString('tr-TR')
  
  return `
MR. SINA - PSİKİYATRİK HASTA RAPORU
=====================================

Rapor ID: ${report.rapor_id}
Oluşturma Tarihi: ${new Date(report.olusturma_tarihi).toLocaleDateString('tr-TR')}
İndirme Tarihi: ${currentDate}

HASTA BİLGİLERİ
===============
Ad Soyad: ${report.hasta.ad} ${report.hasta.soyad}
T.C. Kimlik No: ${report.hasta.tc_kimlik_no}
Doğum Tarihi: ${report.hasta.dogum_tarihi ? new Date(report.hasta.dogum_tarihi).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
Cinsiyet: ${report.hasta.cinsiyet || 'Belirtilmemiş'}

DOKTOR BİLGİLERİ
================
Doktor: Dr. ${report.olusturan_kullanici.ad} ${report.olusturan_kullanici.soyad}
Uzmanlık Alanı: ${report.olusturan_kullanici.uzmanlik_alani}
Hastane ID: ${report.olusturan_kullanici.hastane_id}

YAPAY ZEKA ANALİZİ
==================
${report.yapay_zeka_yorumu || 'Yapay zeka analizi henüz tamamlanmamış.'}

MATEMATİKSEL MODEL ÖNERİLERİ
=============================
${report.optimizasyon_sonucu ? JSON.stringify(report.optimizasyon_sonucu, null, 2) : 'Model önerileri henüz oluşturulmamış.'}

DOKTOR GÖRÜŞLERİ
================
${report.doktor_gorusleri || 'Doktor görüşleri henüz eklenmemiş.'}

GAF UYUM SKORU
==============
${report.gaf_uyum_skoru ? `${report.gaf_uyum_skoru}/100` : 'Henüz değerlendirilmemiş'}

RAPOR DURUMU
============
Durum: ${report.durum}

=====================================
Bu rapor Mr. Sina sistemi tarafından otomatik olarak oluşturulmuştur.
© 2024 Mr. Sina - Tüm hakları saklıdır.
  `
}