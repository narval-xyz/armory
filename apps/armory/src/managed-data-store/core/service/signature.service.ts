import { Jwk, Jwt, hash, verifyJwt } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

@Injectable()
export class SignatureService {
  async verifySignature({
    pubKey,
    payload,
    date
  }: {
    pubKey: Jwk
    payload: { signature: string; data: unknown }
    date: Date | undefined
  }) {
    let validJwt: Jwt

    try {
      validJwt = await verifyJwt(payload.signature, pubKey)
    } catch (error) {
      throw new ApplicationException({
        message: error.message,
        origin: error,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    if (validJwt.payload.data !== hash(payload.data)) {
      throw new ApplicationException({
        message: 'Signature hash mismatch',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    if (date && validJwt.payload.iat && validJwt.payload.iat < date.getTime() / 1000) {
      throw new ApplicationException({
        message: 'Signature timestamp mismatch',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    return true
  }
}
