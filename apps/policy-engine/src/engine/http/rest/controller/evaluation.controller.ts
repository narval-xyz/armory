import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../policy-engine.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { EvaluationService } from '../../../core/service/evaluation.service'
import { EvaluationRequestDto } from '../dto/evaluation-request.dto'
import { SerializedEvaluationResponseDto } from '../dto/serialized-evaluation-response.dto'

@Controller('/evaluations')
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
