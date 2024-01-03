import { Body, Controller, Logger, Post } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { Decision } from '../domain.type'
import { AuthorizationRequestDto } from '../dtos/authorization-request.dto'
import { AuthorizationResponseDto } from '../dtos/authorization-response.dto'

@Controller('/policy-engine')
export class FacadeController {
  private logger = new Logger(FacadeController.name)

  @Post('/evaluation')
  @ApiOkResponse({
    description: 'The authorization evaluation has been successfully processed.',
    type: AuthorizationResponseDto
  })
  evaluate(@Body() evaluation: AuthorizationRequestDto): AuthorizationResponseDto {
    this.logger.log(evaluation)

    return {
      decision: Decision.CONFIRM,
      reasons: [
        {
          code: 'require_approval',
          message: 'Missing one or more approval(s)'
        }
      ]
    }
  }
}
