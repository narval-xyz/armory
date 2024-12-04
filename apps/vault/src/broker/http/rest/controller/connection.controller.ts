import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ConnectionService } from '../../../core/service/connection.service'
import { CreateConnectionDto } from '../dto/request/create-connection.dto'
import { ConnectionDto } from '../dto/response/connection.dto'

@Controller({
  path: 'connections',
  version: '1'
})
@ApiTags('Connection')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post()
  @ApiOperation({
    summary: 'Securely stores a provider connection'
  })
  @ApiResponse({
    description: 'The stored provider connection reference',
    status: HttpStatus.CREATED,
    type: ConnectionDto
  })
  async create(@ClientId() clientId: string, @Body() body: CreateConnectionDto): Promise<ConnectionDto> {
    const connection = await this.connectionService.create(clientId, body)

    return {
      connectionId: connection.id,
      clientId: connection.clientId
    }
  }
}
