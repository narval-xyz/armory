import { JwtError, PublicKey } from '@narval/signature'
import { HttpStatus } from '@nestjs/common'
import { PolicyEngineException } from './policy-engine.exception'

export class InvalidAttestationSignatureException extends PolicyEngineException {
  constructor(token: string, publicKey: PublicKey, error: JwtError) {
    super({
      message: 'Invalid attestation signature',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { publicKey, token },
      origin: error
    })
  }
}
