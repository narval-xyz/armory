import { existsSync } from 'fs'
import { JSONFilePreset } from 'lowdb/node'
import { NextRequest, NextResponse } from 'next/server'
import example from './example.json'

export const GET = async (req: NextRequest, res: NextResponse) => {
  const storageExists = existsSync('./storage.json')

  if (!storageExists) {
    return new Response(JSON.stringify(example))
  }

  const db = await JSONFilePreset('./storage.json', {
    entity: { signature: '', data: {} },
    policy: { signature: '', data: [] }
  })

  return new Response(JSON.stringify({ ...db.data }))
}

export const POST = async (req: NextRequest, res: NextResponse) => {
  const { entity, policy } = await req.json()

  const db = await JSONFilePreset('./storage.json', {
    entity: { signature: '', data: {} },
    policy: { signature: '', data: [] }
  })

  db.data = { entity, policy }

  await db.write()

  return new Response(JSON.stringify({ ...db.data }))
}
