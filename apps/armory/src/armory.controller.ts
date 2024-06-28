import { LoggerService } from '@narval/nestjs-shared'
import { Controller, Get } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

class PongDto extends createZodDto(
  z.object({
    pong: z.boolean()
  })
) {}

@Controller()
@ApiTags('Application')
export class ArmoryController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(ArmoryController.name)
  }

  @Get()
  @ApiExcludeEndpoint()
  healthcheck() {
    return 'Running'
  }

  @Get('/ping')
  @ApiResponse({
    type: PongDto
  })
  ping(): PongDto {
    this.logger.log('Received ping')

    return PongDto.create({ pong: true })
  }
}
