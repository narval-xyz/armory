import { Action, SerializedTransactionRequest } from '@narval/policy-engine-shared'
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { EvaluationService } from '../../../core/service/evaluation.service'
import { EvaluationRequestDto } from '../dto/evaluation-request.dto'

@Controller('/evaluations')
@UseGuards(ClientSecretGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async evaluate(@ClientId() clientId: string, @Body() body: EvaluationRequestDto) {
    return this.evaluationService.evaluate(clientId, body).then((response) => {
      if (response.request?.action === Action.SIGN_TRANSACTION) {
        const serializedTxRequest = SerializedTransactionRequest.parse(response.request.transactionRequest)
        return {
          ...response,
          request: {
            ...response.request,
            transactionRequest: serializedTxRequest
          }
        }
      }
      return response
    })
  }
}
