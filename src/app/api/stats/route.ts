import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get total hospitals count
    const totalHospitals = await prisma.hastaneler.count()

    // Get total patients count
    const totalPatients = await prisma.hastalar.count()

    // Get total doctors count
    const totalDoctors = await prisma.kullanicilar.count({
      where: {
        rol: 'DOKTOR'
      }
    })

    return NextResponse.json({
      totalHospitals,
      totalPatients,
      totalDoctors
    })

  } catch (error: any) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message || 'Bilinmeyen hata' }, { status: 500 })
  }
}