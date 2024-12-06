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
    summary: 'Initiate a new connection',
    description:
      'This endpoint initiates a new connection by generating a public key and an encryption key for secure communication.'
  })
  @ApiResponse({
    description: 'Returns the public key and encryption key for the initiated connection.',
    status: HttpStatus.CREATED,
    type: PendingConnectionDto
  })
  async initiate(@ClientId() clientId: string, @Body() body: InitiateConnectionDto): Promise<PendingConnectionDto> {
    const pendingConnection = await this.connectionService.initiate(clientId, body)

    return PendingConnectionDto.create(pendingConnection)
  }

  @Post()
  @ApiOperation({
    summary: 'Store a provider connection securely',
    description:
      'This endpoint securely stores the details of a provider connection, ensuring that all sensitive information is encrypted.'
  })
  @ApiResponse({
    description: 'Returns a reference to the stored provider connection.',
    status: HttpStatus.CREATED,
    type: ConnectionDto
  })
  async create(@ClientId() clientId: string, @Body() body: CreateConnectionDto): Promise<ConnectionDto> {
    const connection = await this.connectionService.create(clientId, body)

    return ConnectionDto.create(this.toResponse(connection))
  }

  private toResponse(connection: Connection) {
    return {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      status: connection.status
    }
  }

  @Delete(':connectionId')
  @ApiOperation({
    summary: 'Revoke an existing connection',
    description:
      'This endpoint revokes an existing connection, effectively terminating any ongoing communication and invalidating the connection credentials.'
  })
  @ApiResponse({
    description: 'Indicates that the connection has been successfully revoked. No content is returned in the response.',
    status: HttpStatus.NO_CONTENT
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@ClientId() clientId: string, @Param('connectionId') connectionId: string): Promise<void> {
    await this.connectionService.revoke(clientId, connectionId)
  }
}
