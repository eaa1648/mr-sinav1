import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    const patientId = params.patientId

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

    const mrImages = await prisma.mR_Goruntuleri.findMany({
      where: { hasta_id: patientId },
      orderBy: { cekilis_tarihi: 'desc' }
    })

    return NextResponse.json({ mrImages })

  } catch (error) {
    console.error('Get MR images error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    const patientId = params.patientId

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
        return NextResponse.json({ error: 'Bu hastaya MR yükleme yetkiniz yok' }, { status: 403 })
      }
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const cekilis_tarihi = formData.get('cekilis_tarihi') as string

    if (!file) {
      return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 })
    }

    if (!cekilis_tarihi) {
      return NextResponse.json({ error: 'Çekiliş tarihi gerekli' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'application/dicom']
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.dcm')) {
      return NextResponse.json({ error: 'Geçersiz dosya türü' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'mr-images', patientId)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'dcm'
    const filename = `mr_${timestamp}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save to database
    const mrImage = await prisma.mR_Goruntuleri.create({
      data: {
        hasta_id: patientId,
        cekilis_tarihi: new Date(cekilis_tarihi),
        orijinal_dosya_yolu: filepath,
        dosya_boyutu: buffer.length,
        isleme_durumu: 'BEKLEMEDE'
      }
    })

    // TODO: Trigger image processing pipeline
    // This would call your Python/PyTorch image processing service

    return NextResponse.json({
      message: 'MR görüntüsü başarıyla yüklendi',
      mrImage
    }, { status: 201 })

  } catch (error) {
    console.error('Upload MR image error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}