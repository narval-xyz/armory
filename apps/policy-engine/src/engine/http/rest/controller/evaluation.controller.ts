import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { EvaluationService } from '../../../core/service/evaluation.service'
import { EvaluationRequestDto } from '../dto/evaluation-request.dto'
import { SerializedEvaluationResponseDto } from '../dto/serialized-evaluation-response.dto'

@Controller({
  path: '/evaluations',
  version: '1'
})
@ApiTags('Evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluates a request into a decision'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CLIENT_ID
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SerializedEvaluationResponseDto
  })
  async evaluate(
    @ClientId() clientId: string,
    @Body() body: EvaluationRequestDto
  ): Promise<SerializedEvaluationResponseDto> {
    const evaluation = await this.evaluationService.evaluate(clientId, body)

    return SerializedEvaluationResponseDto.create(evaluation)
  }
}
