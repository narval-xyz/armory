import { Jwk, hash, verifyJwt } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

@Injectable()
export class SignatureService<T> {
  async verifySignature({
    pubKey,
    payload,
    date
  }: {
    pubKey: Jwk
    payload: { signature: string; data: T }
    date: Date | undefined
  }) {
    const validJwt = await verifyJwt(payload.signature, pubKey)

    if (validJwt.payload.data !== hash(payload.data)) {
      throw new ApplicationException({
        message: 'Signature hash mismatch',
        suggestedHttpStatusCode: 403
      })
    }

    if (date && validJwt.payload.iat && validJwt.payload.iat < date.getTime() / 1000) {
      throw new ApplicationException({
        message: 'Signature timestamp mismatch',
        suggestedHttpStatusCode: 403
      })
    }

    return true
  }
}
