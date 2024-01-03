import { Body, Controller, Get, Logger, Post } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { PrismaService } from '../../persistence/service/prisma.service'
import { Decision } from '../domain.type'
import { AuthorizationRequestDto } from '../dto/authorization-request.dto'
import { AuthorizationResponseDto } from '../dto/authorization-response.dto'

@Controller('/policy-engine')
export class FacadeController {
  private logger = new Logger(FacadeController.name)

  constructor(private prismaService: PrismaService) {}

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

  @Get('/users')
  justCheckingTheDatabase() {
    return this.prismaService.user.findMany()
  }
}
