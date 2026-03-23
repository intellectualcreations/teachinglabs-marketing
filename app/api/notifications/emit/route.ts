import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, title, message } = body
  
  const notification = {
    id: crypto.randomUUID(),
    type: type || 'info',
    title: title || 'Notification',
    message: message || '',
    timestamp: new Date().toISOString()
  }
  
  return NextResponse.json({ success: true, notification })
}
