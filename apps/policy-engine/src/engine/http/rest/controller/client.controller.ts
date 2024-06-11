import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { AdminApiKeyGuard } from '../../../../shared/guard/admin-api-key.guard'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { ClientService } from '../../../core/service/client.service'
import { CreateClientRequestDto, CreateClientResponseDto } from '../dto/create-client.dto'

@Controller('/clients')
@ApiTags('Client Management')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  @UseGuards(AdminApiKeyGuard)
  @ApiOperation({
    summary: 'Creates a new client'
  })
  @ApiResponse({
    description: 'The client has been successfully created',
    status: HttpStatus.CREATED,
    type: CreateClientResponseDto
  })
  async create(@Body() body: CreateClientRequestDto): Promise<CreateClientResponseDto> {
    const client = await this.clientService.create({
      clientId: body.clientId,
      clientSecret: body.clientSecret,
      unsafeKeyId: body.keyId,
      entityDataStore: body.entityDataStore,
      policyDataStore: body.policyDataStore
    })

    return CreateClientResponseDto.create(client)
  }

  @Post('/sync')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  @ApiOperation({
    summary: 'Initiate the client data stores synchronization'
  })
  async sync(@ClientId() clientId: string) {
    try {
      const success = await this.clientService.syncDataStore(clientId)

      return {
        latestSync: {
          success
        }
      }
    } catch (error) {
      return {
        latestSync: {
          success: false
        }
      }
    }
  }
}
