import { HttpStatus } from '@nestjs/common'
import { PolicyEngineException } from '../exception/policy-engine.exception'
import { Cluster } from '../type/clustering.type'

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
