import { HttpStatus } from '@nestjs/common'
import { PolicyEngineException } from './policy-engine.exception'

export class InvalidAttestationSignatureException extends PolicyEngineException {
  constructor(nodePubKey: string, recoveredPubKey: string) {
    super({
      message: 'Invalid attestation signature',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { recoveredPubKey, nodePubKey }
    })
  }
}
