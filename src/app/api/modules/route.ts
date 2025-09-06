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

    const modules = await prisma.klinik_Moduller.findMany({
      orderBy: { modul_adi: 'asc' }
    })

    return NextResponse.json({ modules })

  } catch (error) {
    console.error('Get modules error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}