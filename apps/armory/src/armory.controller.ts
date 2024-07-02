import { Controller, Get, Logger } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

class PongDto extends createZodDto(
  z.object({
    pong: z.boolean()
  })
) {}

@Controller({
  version: '1'
})
@ApiTags('Application')
export class ArmoryController {
  private logger = new Logger(ArmoryController.name)

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
    this.logger.log({
      message: 'Received ping'
    })

    return PongDto.create({ pong: true })
  }
}
