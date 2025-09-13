import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { createSystemUpdateNotification } from '@/lib/notifications'

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

    // Create a system update notification for demonstration
    // In a real application, this would be triggered by actual system events
    try {
      // Only create notification occasionally to avoid spam
      if (Math.random() < 0.1) { // 10% chance
        await createSystemUpdateNotification(
          payload.userId,
          'Sistemde yeni özellikler mevcut! En son AI modelleriyle daha hızlı analizler.'
        )
      }
    } catch (notificationError) {
      console.error('Failed to create system update notification:', notificationError)
    }

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