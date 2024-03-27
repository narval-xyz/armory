import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { EvaluationService } from '../../../core/service/evaluation.service'
import { EvaluationRequestDto } from '../../../evaluation-request.dto'

@Controller('/evaluations')
@UseGuards(ClientSecretGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async evaluate(@ClientId() clientId: string, @Body() body: EvaluationRequestDto) {
    return this.evaluationService.evaluate(clientId, body)
  }
}
