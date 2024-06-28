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
export class VaultController {
  constructor(private logger: LoggerService) {}

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
