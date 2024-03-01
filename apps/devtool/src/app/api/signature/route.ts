import { readFileSync, writeFileSync } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'

export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const signature = JSON.parse(readFileSync('./storage/signature.json', 'utf-8'))
  return new Response(JSON.stringify({ ...signature }))
}

export const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { signature, policies } = await req.json()
  writeFileSync('./storage/signature.json', JSON.stringify({ signature }))
  writeFileSync('./storage/policies.json', JSON.stringify({ policies }))
  return new Response('Success!')
}
