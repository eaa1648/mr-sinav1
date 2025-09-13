import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || undefined)
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    // Only admins can update hospitals
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
    }

    const data = await request.json()

    const hospital = await prisma.hastaneler.update({
      where: { hastane_id: params.id },
      data: {
        hastane_adi: data.hastane_adi,
        sehir: data.sehir,
        adres: data.adres,
        telefon: data.telefon,
        email: data.email,
        website: data.website,
        koordinat_x: data.koordinat_x ? parseFloat(data.koordinat_x) : null,
        koordinat_y: data.koordinat_y ? parseFloat(data.koordinat_y) : null
      }
    })

    return NextResponse.json({ hospital })

  } catch (error: any) {
    console.error('Update hospital error:', error)
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message || 'Bilinmeyen hata' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || undefined)
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    // Only admins can delete hospitals
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
    }

    // Check if hospital has any users
    const userCount = await prisma.kullanicilar.count({
      where: { hastane_id: params.id }
    })

    if (userCount > 0) {
      return NextResponse.json({ error: 'Bu hastanede kayıtlı kullanıcılar olduğu için silinemez' }, { status: 400 })
    }

    await prisma.hastaneler.delete({
      where: { hastane_id: params.id }
    })

    return NextResponse.json({ message: 'Hastane başarıyla silindi' })

  } catch (error: any) {
    console.error('Delete hospital error:', error)
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message || 'Bilinmeyen hata' }, { status: 500 })
  }
}