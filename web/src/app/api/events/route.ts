import { NextRequest } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// File path for persistent storage
const DATA_DIR = join(process.cwd(), 'data')
const MESSAGES_FILE = join(DATA_DIR, 'messages.json')

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

// Load messages from file on startup
function loadMessages(): Array<{ event: string; message: string; timestamp: string }> {
  try {
    if (existsSync(MESSAGES_FILE)) {
      const data = readFileSync(MESSAGES_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load messages:', e)
  }
  return []
}

// Save messages to file
function saveMessages(messages: Array<{ event: string; message: string; timestamp: string }>) {
  try {
    writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2))
  } catch (e) {
    console.error('Failed to save messages:', e)
  }
}

// Store connected clients and messages
const clients = new Set<ReadableStreamDefaultController>()
const messageStore = loadMessages()

// Broadcast to all connected clients
function broadcast(data: { event: string; message: string; timestamp: string }) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  clients.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message))
    } catch {
      clients.delete(controller)
    }
  })
}

// Store message (keep last 500 for history)
export function storeMessage(event: string, message: string) {
  const timestamp = new Date().toLocaleTimeString()
  const data = { event, message, timestamp }
  messageStore.push(data)
  if (messageStore.length > 500) {
    messageStore.shift()
  }
  // Save to file for persistence
  saveMessages(messageStore)
  broadcast(data)
  return data
}

// Get all messages
export function getMessages() {
  return [...messageStore]
}

// SSE endpoint
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)

      // Send initial connection message
      const initMessage = `data: ${JSON.stringify({ event: 'connected', message: 'Connected to Huggsy' })}\n\n`
      controller.enqueue(new TextEncoder().encode(initMessage))

      // Send keepalive every 30 seconds
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'))
        } catch {
          clearInterval(keepalive)
          clients.delete(controller)
        }
      }, 30000)

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepalive)
        clients.delete(controller)
      })
    },
    cancel() {
      // Client disconnected
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
