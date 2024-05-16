import { HttpStatus } from '@nestjs/common'
import { PolicyEngineNode } from '../type/cluster.type'
import { PolicyEngineException } from './policy-engine.exception'

export class ConsensusAgreementNotReachException extends PolicyEngineException {
  constructor(responses: unknown[], nodes: PolicyEngineNode[]) {
    super({
      message: 'Cluster nodes responses have not reach a consensus',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: {
        responses,
        nodes: nodes.map(({ id, url }) => ({ id, url }))
      }
    })
  }
}
