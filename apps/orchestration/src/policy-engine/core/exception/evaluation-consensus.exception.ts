import { PolicyEngineException } from '@app/orchestration/policy-engine/core/exception/policy-engine.exception'
import { Node } from '@app/orchestration/policy-engine/core/type/clustering.type'
import { EvaluationResponse } from '@narval/authz-shared'
import { HttpStatus } from '@nestjs/common'

export class EvaluationConsensusException extends PolicyEngineException {
  constructor(responses: EvaluationResponse[], nodes: Node[]) {
    super({
      message: 'Evaluation request consensus error',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { responses, nodes }
    })
  }
}
