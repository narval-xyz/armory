import { hashRequest } from '@narval/authz-shared'
import { JWTPayload, importSPKI, jwtVerify } from 'jose'
import { Payload, VerificationInput } from '../types'

function isPayload(payload: JWTPayload): payload is Payload {
  return (
    'requestHash' in payload &&
    typeof payload.requestHash === 'string' &&
    'iat' in payload &&
    typeof payload.iat === 'number'
  )
}
export async function verify(input: VerificationInput): Promise<Payload> {
  const { rawToken, request, algorithm, publicKey } = input
  const publicKeyObj = await importSPKI(publicKey, algorithm)

  const { payload } = await jwtVerify(rawToken, publicKeyObj, {
    algorithms: [algorithm]
  })

  if (!isPayload(payload)) {
    throw new Error('Invalid payload')
  }

  const requestHash = hashRequest(request)
  if (payload.requestHash !== requestHash) {
    throw new Error('Request hash mismatch')
  }

  return payload
}
