import { createHash, randomBytes } from 'crypto'

export const hashSecret = (value: string) => createHash('sha256').update(value).digest('hex')

export const generateSecret = (size = 42): string => randomBytes(size).toString('hex')
