import { HttpStatus } from '@nestjs/common'
import { PolicyEngineException } from './policy-engine.exception'

export class ClusterNotFoundException extends PolicyEngineException {
  constructor(clientId: string) {
    super({
      message: 'Cluster not found',
      suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
      context: { clientId }
    })
  }
}
