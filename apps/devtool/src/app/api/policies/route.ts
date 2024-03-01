import { readFileSync } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'

export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const policies = JSON.parse(readFileSync('./storage/policies.json', 'utf-8'))
  return new Response(JSON.stringify({ ...policies }))
}
