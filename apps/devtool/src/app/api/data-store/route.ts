import { EntityStore, FIXTURE, PolicyStore } from '@narval/policy-engine-shared'
import { existsSync } from 'fs'
import { JSONFilePreset } from 'lowdb/node'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest, res: NextResponse) => {
  const storageExists = existsSync('./storage.json')

  if (!storageExists) {
    return new Response(
      JSON.stringify({
        entity: {
          data: FIXTURE.ENTITIES
        } satisfies Omit<EntityStore, 'signature'>,
        policy: {
          data: FIXTURE.POLICIES
        } satisfies Omit<PolicyStore, 'signature'>
      })
    )
  }

  const db = await JSONFilePreset('./storage.json', {
    entity: { signature: '', data: {} },
    policy: { signature: '', data: [] }
  })

  // TODO @samteb: Refactor CORS headers
  return new Response(JSON.stringify({ ...db.data }), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

export const POST = async (req: NextRequest, res: NextResponse) => {
  const { entity: newEntity, policy: newPolicy } = await req.json()

  const db = await JSONFilePreset('./storage.json', {
    entity: { signature: '', data: {} },
    policy: { signature: '', data: [] }
  })

  const savedEntity = db.data.entity
  const savedPolicy = db.data.policy

  const entity = newEntity ? { ...savedEntity, ...newEntity } : savedEntity
  const policy = newPolicy ? { ...savedPolicy, ...newPolicy } : savedPolicy

  db.data = { entity, policy }

  await db.write()

  return new Response(JSON.stringify({ ...db.data }))
}
