import { NextRequest, NextResponse } from 'next/server'

// Minimal in-memory buffer (stateless envlerde log to console)
let buffer: Array<Record<string, unknown>> = []

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const entry: Record<string, unknown> = {
      ...payload,
      receivedAt: new Date().toISOString(),
      ua: request.headers.get('user-agent') ?? undefined,
    }
    buffer.push(entry)

    // For now, log to server console; can be forwarded to analytics/DB later
    // In serverless, this may not persist; use 3rd party or DB for production
    console.info('[WebVitals]', entry)

    // Keep buffer bounded
    if (buffer.length > 1000) buffer = buffer.slice(-200)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Vitals POST error', error)
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}







