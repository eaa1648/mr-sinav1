import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

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

    // Get total patients count for the doctor
    const totalPatients = await prisma.hasta_Kayitlari.count({
      where: {
        kullanici_id: payload.userId,
        aktif: true
      }
    })

    // Get MR count for last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const recentMRCount = await prisma.mR_Goruntuleri.count({
      where: {
        hasta: {
          hasta_kayitlari: {
            some: {
              kullanici_id: payload.userId,
              aktif: true
            }
          }
        },
        created_at: {
          gte: yesterday
        }
      }
    })

    // Get pending reports count
    const pendingReportsCount = await prisma.raporlar.count({
      where: {
        hasta: {
          hasta_kayitlari: {
            some: {
              kullanici_id: payload.userId,
              aktif: true
            }
          }
        },
        durum: 'TASLAK'
      }
    })

    // Get today's activities count (simplified as recent patient records)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayActivitiesCount = await prisma.hasta_Kayitlari.count({
      where: {
        kullanici_id: payload.userId,
        kayit_tarihi: {
          gte: today
        }
      }
    })

    return NextResponse.json({
      totalPatients,
      recentMRCount,
      pendingReportsCount,
      todayActivitiesCount
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}