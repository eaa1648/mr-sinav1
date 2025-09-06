import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

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
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Build where clause based on user role and status filter
    const where: any = {}
    
    if (status === 'pending') {
      where.isleme_durumu = { in: ['BEKLEMEDE', 'ISLENIYOR'] }
    } else if (status) {
      where.isleme_durumu = status.toUpperCase()
    }

    // If not admin, filter by user's patients
    if (payload.role !== 'ADMIN') {
      where.hasta = {
        hasta_kayitlari: {
          some: {
            kullanici_id: payload.userId,
            aktif: true
          }
        }
      }
    }

    const [mrImages, total] = await Promise.all([
      prisma.mR_Goruntuleri.findMany({
        where,
        include: {
          hasta: {
            select: {
              ad: true,
              soyad: true,
              tc_kimlik_no: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.mR_Goruntuleri.count({ where })
    ])

    return NextResponse.json({
      mrImages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get MR images error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}