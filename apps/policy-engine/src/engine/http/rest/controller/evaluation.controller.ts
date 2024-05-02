import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from 'apps/policy-engine/src/policy-engine.constant'
import { ZodSerializerDto } from 'nestjs-zod'
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
  @ApiOperation({
    summary: 'Evaluates a request into a decision.'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CLIENT_ID
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SerializedEvaluationResponseDto
  })
  @ZodSerializerDto(SerializedEvaluationResponseDto)
  async evaluate(@ClientId() clientId: string, @Body() body: EvaluationRequestDto) {
    return this.evaluationService.evaluate(clientId, body)
  }
}
