import { NextRequest, NextResponse } from 'next/server'
import { storeMessage } from '../events/route'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, message } = body

    if (!event || !message) {
      return NextResponse.json(
        { error: 'Missing event or message' },
        { status: 400 }
      )
    }

    // Log to console
    const timestamp = new Date().toLocaleTimeString()
    if (event === 'user_speech') {
      console.log(`\n[${timestamp}] USER: ${message}`)
    } else if (event === 'ai_response') {
      console.log(`[${timestamp}] AI: ${message}`)
    } else if (event === 'ai_emotion') {
      console.log(`[${timestamp}] EMOTION: ${message}`)
    } else {
      console.log(`[${timestamp}] ${event}: ${message}`)
    }

    // Store and broadcast
    storeMessage(event, message)

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Error processing chatbot message:', error)
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
