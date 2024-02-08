import { EvaluationResponse } from '@narval/authz-shared'
import { HttpStatus } from '@nestjs/common'
import { Node } from '../type/clustering.type'
import { PolicyEngineException } from './policy-engine.exception'

export class EvaluationConsensusException extends PolicyEngineException {
  constructor(responses: EvaluationResponse[], nodes: Node[]) {
    super({
      message: 'Evaluation request consensus error',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { responses, nodes }
    })
  }
}
