import { NextRequest } from 'next/server'

const clients = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') || 'anonymous'
  
  const stream = new ReadableStream({
    start(controller) {
      clients.set(userId, controller)
      const keepAlive = setInterval(() => {
        try { controller.enqueue('data: {"type":"ping"}\n\n') } 
        catch { clearInterval(keepAlive); clients.delete(userId) }
      }, 30000)
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        clients.delete(userId)
        try { controller.close() } catch {}
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
