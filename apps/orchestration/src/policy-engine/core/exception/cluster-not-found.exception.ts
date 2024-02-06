import { PolicyEngineException } from '@app/orchestration/policy-engine/core/exception/policy-engine.exception'
import { HttpStatus } from '@nestjs/common'

export class ClusterNotFoundException extends PolicyEngineException {
  constructor(orgId: string) {
    super({
      message: 'Cluster not found',
      suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
      context: { orgId }
    })
  }
}
