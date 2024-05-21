import { HttpStatus } from '@nestjs/common'
import { PolicyEngineException } from '../exception/policy-engine.exception'
import { PolicyEngineNode } from '../type/cluster.type'

export class UnreachableClusterException extends PolicyEngineException {
  constructor(clientId: string, nodes: PolicyEngineNode[]) {
    super({
      message: 'Cluster is unreachable',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: {
        clientId,
        nodes: nodes.map(({ id, url }) => ({ id, url }))
      }
    })
  }
}
