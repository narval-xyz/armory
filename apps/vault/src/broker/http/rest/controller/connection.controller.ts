import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ConnectionService } from '../../../core/service/connection.service'
import { Connection } from '../../../core/type/connection.type'
import { CreateConnectionDto } from '../dto/request/create-connection.dto'
import { InitiateConnectionDto } from '../dto/request/initiate-connection.dto'
import { ConnectionDto } from '../dto/response/connection.dto'
import { PendingConnectionDto } from '../dto/response/pending-connection.dto'

@Controller({
  path: 'connections',
  version: '1'
})
@ApiTags('Connection')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('/initiate')
  @ApiOperation({
    summary: 'Initiate a connection'
  })
  @ApiResponse({
    description: 'Connection public key and encryption key',
    status: HttpStatus.CREATED,
    type: PendingConnectionDto
  })
  async initiate(@ClientId() clientId: string, @Body() body: InitiateConnectionDto): Promise<PendingConnectionDto> {
    return this.connectionService.initiate(clientId, body)
  }

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

    return this.toResponse(connection)
  }

  private toResponse(connection: Connection) {
    return {
      connectionId: connection.id,
      clientId: connection.clientId,
      status: connection.status
    }
  }

  @Delete(':connectionId')
  @ApiOperation({
    summary: 'Securely stores a provider connection'
  })
  @ApiResponse({
    description: 'The stored provider connection reference',
    status: HttpStatus.CREATED,
    type: ConnectionDto
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@ClientId() clientId: string, @Param('connectionId') connectionId: string): Promise<void> {
    await this.connectionService.revoke(clientId, connectionId)
  }
}
