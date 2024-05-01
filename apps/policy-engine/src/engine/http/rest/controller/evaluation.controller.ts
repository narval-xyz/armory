import { SerializedEvaluationResponse } from '@narval/policy-engine-shared'
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { EvaluationService } from '../../../core/service/evaluation.service'
import { EvaluationRequestDto } from '../dto/evaluation-request.dto'
import { SerializedEvaluationResponseDto } from '../dto/serialized-evaluation-response.dto'

@Controller('/evaluations')
@UseGuards(ClientSecretGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async evaluate(
    @ClientId() clientId: string,
    @Body() body: EvaluationRequestDto
  ): Promise<SerializedEvaluationResponseDto> {
    return this.evaluationService.evaluate(clientId, body).then((response) => {
      return SerializedEvaluationResponse.parse(response)
    })
  }
}
