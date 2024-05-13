import { createHash } from 'crypto'

export const hashSecret = (value: string) => createHash('sha256').update(value).digest('hex')
