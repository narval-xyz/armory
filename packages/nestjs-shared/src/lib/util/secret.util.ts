import { createHash, randomBytes } from 'crypto'

// echo -n "my-api-key" | openssl dgst -sha256 | awk '{print $2}'
export const hash = (value: string) => createHash('sha256').update(value).digest('hex')

// openssl rand -hex 42
export const generate = (size = 42): string => randomBytes(size).toString('hex')
