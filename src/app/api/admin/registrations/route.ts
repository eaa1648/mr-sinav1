import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || '')
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    // Only admins can view pending registrations
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'BEKLEMEDE'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const where = {
      durum: status as 'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI'
    }

    const [registrations, totalCount] = await Promise.all([
      prisma.bekleyen_Kayitlar.findMany({
        where,
        orderBy: { basvuru_tarihi: 'desc' },
        skip,
        take: limit
      }),
      prisma.bekleyen_Kayitlar.count({ where })
    ])

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Get pending registrations error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || '')
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    // Only admins can approve/reject registrations
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
    }

    const data = await request.json()
    const { registrationId, action, rejectionReason } = data

    if (!registrationId || !action) {
      return NextResponse.json({ error: 'Gerekli parametreler eksik' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    }

    const registration = await prisma.bekleyen_Kayitlar.findUnique({
      where: { id: registrationId }
    })

    if (!registration) {
      return NextResponse.json({ error: 'Kayıt başvurusu bulunamadı' }, { status: 404 })
    }

    if (registration.durum !== 'BEKLEMEDE') {
      return NextResponse.json({ error: 'Bu başvuru zaten işleme alınmış' }, { status: 400 })
    }

    if (action === 'approve') {
      // Check if hospital exists
      const hospital = await prisma.hastaneler.findUnique({
        where: { hastane_id: registration.hastane_id }
      })

      if (!hospital) {
        return NextResponse.json({ 
          error: `Hastane bulunamadı (ID: ${registration.hastane_id}). Bu başvuruyu onaylamadan önce hastanenin sistemde kayıtlı olduğundan emin olun.` 
        }, { status: 400 })
      }

      // Create the user account
      const newUser = await prisma.kullanicilar.create({
        data: {
          tc_kimlik_no: registration.tc_kimlik_no,
          ad: registration.ad,
          soyad: registration.soyad,
          uzmanlik_alani: registration.uzmanlik_alani,
          hastane_id: registration.hastane_id,
          rol: 'DOKTOR',
          sifre: registration.sifre
        }
      })

      // Update registration status
      await prisma.bekleyen_Kayitlar.update({
        where: { id: registrationId },
        data: {
          durum: 'ONAYLANDI',
          onay_tarihi: new Date(),
          onaylayan_kullanici_id: payload.userId
        }
      })

      return NextResponse.json({
        message: 'Kayıt başvurusu onaylandı ve kullanıcı hesabı oluşturuldu',
        userId: newUser.kullanici_id
      })

    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json({ error: 'Red nedeni belirtilmeli' }, { status: 400 })
      }

      await prisma.bekleyen_Kayitlar.update({
        where: { id: registrationId },
        data: {
          durum: 'REDDEDILDI',
          onay_tarihi: new Date(),
          onaylayan_kullanici_id: payload.userId,
          red_nedeni: rejectionReason
        }
      })

      return NextResponse.json({
        message: 'Kayıt başvurusu reddedildi'
      })
    }

  } catch (error) {
    console.error('Process registration error:', error)
    // Check if it's a foreign key constraint error
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Veritabanı hatası: Hastane bulunamadı. Bu başvuruyu onaylamadan önce hastanenin sistemde kayıtlı olduğundan emin olun.' 
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}