import { NextRequest, NextResponse } from 'next/server'
import { runFreeSurferAnalysis, collectFreeSurferStats, getFreeSurferSubjectStatus } from '@/lib/pythonService'

// Mock authentication middleware (in a real app, you would use proper authentication)
function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  // In a real implementation, you would verify the token
  return authHeader && authHeader.startsWith('Bearer ')
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'startAnalysis':
        // Start FreeSurfer analysis
        const analysisResult = await runFreeSurferAnalysis(
          params.niftiFilePath,
          params.subjectId,
          params.flags
        )
        return NextResponse.json(analysisResult)

      case 'collectStats':
        // Collect statistical data
        const statsResult = await collectFreeSurferStats(params.subjectId)
        return NextResponse.json(statsResult)

      case 'getStatus':
        // Get subject status
        const statusResult = await getFreeSurferSubjectStatus(params.subjectId)
        return NextResponse.json(statusResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('FreeSurfer API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}