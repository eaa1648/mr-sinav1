// Notifications API Route
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { BildirimTipi, BildirimOncelik } from '@prisma/client'

// Get notifications for a user
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeRead = searchParams.get('includeRead') === 'true'

    const whereClause = {
      kullanici_id: payload.userId,
      ...(includeRead ? {} : { okundu: false })
    }

    const notifications = await prisma.bildirimler.findMany({
      where: whereClause,
      orderBy: { olusturulma_tarihi: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.bildirimler.count({ where: whereClause })

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || undefined)
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    const { notificationId, read } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: 'Bildirim ID gerekli' }, { status: 400 })
    }

    const notification = await prisma.bildirimler.update({
      where: {
        bildirim_id: notificationId,
        kullanici_id: payload.userId
      },
      data: {
        okundu: read !== undefined ? read : true,
        guncelleme_tarihi: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Bildirim başarıyla güncellendi',
      notification
    })
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Delete notification
export async function DELETE(request: NextRequest) {
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
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json({ error: 'Bildirim ID gerekli' }, { status: 400 })
    }

    await prisma.bildirimler.delete({
      where: {
        bildirim_id: notificationId,
        kullanici_id: payload.userId
      }
    })

    return NextResponse.json({ message: 'Bildirim başarıyla silindi' })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Create a new notification (for internal use)
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

    // Only admins can create notifications for other users
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { userId, title, message, type, priority, actionUrl } = await request.json()

    if (!userId || !title || !message || !type) {
      return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 })
    }

    const notification = await prisma.bildirimler.create({
      data: {
        kullanici_id: userId,
        baslik: title,
        mesaj: message,
        tip: type as BildirimTipi,
        oncelik: priority as BildirimOncelik || BildirimOncelik.ORTA,
        action_url: actionUrl,
        olusturulma_tarihi: new Date(),
        guncelleme_tarihi: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Bildirim başarıyla oluşturuldu',
      notification
    }, { status: 201 })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
