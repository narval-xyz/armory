import { Jwk, hash, verifyJwt } from '@narval/signature'
import { ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class SignatureService<T> {
  async verifySignature({
    key,
    payload,
    timestamp
  }: {
    key: Jwk
    payload: { signature: string; data: T }
    timestamp: Date | undefined
  }) {
    const validJwt = await verifyJwt(payload.signature, key)

    if (validJwt.payload.data !== hash(payload.data)) {
      throw new ForbiddenException({
        message: 'Signature hash mismatch',
        suggestedHttpStatusCode: 403
      })
    }

    if (timestamp && validJwt.payload.iat && validJwt.payload.iat < timestamp.getTime()) {
      throw new ForbiddenException({
        message: 'Signature timestamp mismatch',
        suggestedHttpStatusCode: 403
      })
    }

    return true
  }
}
