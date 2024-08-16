import { Jwk, Jwt, decodeJwt, hash, verifyJwt } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

@Injectable()
export class SignatureService {
  async verifySignature(params: {
    keys: Jwk[]
    payload: { signature: string; data: unknown }
    date: Date | undefined
  }) {
    const { keys, payload, date } = params
    let validJwt: Jwt | undefined

    const jwt = decodeJwt(payload.signature)
    const jwk = params.keys.find(({ kid }) => kid && kid?.toLowerCase() === jwt.header.kid?.toLowerCase())

    // If we can't find by kid in the header, we'll have to attempt each key in order
    const pubKeys = jwk ? [jwk] : keys

    const errors = []
    for (const pubKey of pubKeys) {
      try {
        validJwt = await verifyJwt(payload.signature, pubKey)
        break
      } catch (error) {
        errors.push(
          new ApplicationException({
            message: error.message,
            origin: error,
            suggestedHttpStatusCode: HttpStatus.FORBIDDEN
          })
        )
        continue
      }
    }

    // Did not find a valid key for the signature
    if (!validJwt) {
      throw new ApplicationException({
        message: 'Signature not valid for keys',
        context: errors,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    // Signature was valid but the data is a mismatch
    if (validJwt.payload.data !== hash(payload.data)) {
      throw new ApplicationException({
        message: 'Signature hash mismatch',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    // Signature is valid but this data is older than current.
    if (date && validJwt.payload.iat && validJwt.payload.iat < date.getTime() / 1000) {
      throw new ApplicationException({
        message: 'Signature timestamp mismatch',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    return true
  }
}
