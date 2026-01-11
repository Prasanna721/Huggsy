import { NextResponse } from 'next/server'
import { getMessages } from '../events/route'

export async function GET() {
  const messages = getMessages()
  return NextResponse.json(messages, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  })
}
