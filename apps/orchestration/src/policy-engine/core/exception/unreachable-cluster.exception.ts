import { PolicyEngineException } from '@app/orchestration/policy-engine/core/exception/policy-engine.exception'
import { Cluster } from '@app/orchestration/policy-engine/core/type/clustering.type'
import { HttpStatus } from '@nestjs/common'

export class UnreachableClusterException extends PolicyEngineException {
  constructor(cluster: Cluster) {
    super({
      message: 'Cluster is unreachable',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: {
        clusterId: cluster.id,
        size: cluster.size
      }
    })
  }
}
