import { createHash, randomBytes } from 'crypto'

export const hash = (value: string) => createHash('sha256').update(value).digest('hex')

export const generate = (size = 42): string => randomBytes(size).toString('hex')
