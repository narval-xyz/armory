import { HttpStatus } from '@nestjs/common'
import { Node } from '../type/clustering.type'
import { PolicyEngineException } from './policy-engine.exception'

export class ConsensusAgreementNotReachException extends PolicyEngineException {
  constructor(responses: unknown[], nodes: Node[]) {
    super({
      message: 'Cluster nodes responses have not reach a consensus',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { responses, nodes }
    })
  }
}
