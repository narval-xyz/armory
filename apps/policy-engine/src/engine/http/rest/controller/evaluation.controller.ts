import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { EvaluationService } from '../../../core/service/evaluation.service'
import { EvaluationRequestDto } from '../../../evaluation-request.dto'

@Controller('/evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async evaluate(@ClientId() clientId: string, @Body() body: EvaluationRequestDto) {
    return this.evaluationService.evaluate(clientId, body)
  }
}
