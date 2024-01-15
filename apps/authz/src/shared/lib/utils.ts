import { AuthZRequest } from '@app/authz/shared/types/http'
import crypto from 'crypto'

export const hashBody = (body: AuthZRequest) => {
  const stringBody = JSON.stringify(body)
  const hash = crypto.createHash('sha256').update(stringBody).digest('hex')
  return hash
}
