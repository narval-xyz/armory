import { PolicyEngineException } from '@app/orchestration/policy-engine/core/exception/policy-engine.exception'
import { HttpStatus } from '@nestjs/common'

export class InvalidAttestationSignatureException extends PolicyEngineException {
  constructor(nodePubKey: string, recoveredPubKey: string) {
    super({
      message: 'Invalid attestation signature',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { recoveredPubKey, nodePubKey }
    })
  }
}
