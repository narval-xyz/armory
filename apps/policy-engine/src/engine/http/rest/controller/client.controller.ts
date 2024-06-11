import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AdminGuard } from '../../../../shared/decorator/admin-guard.decorator'
import { ClientGuard } from '../../../../shared/decorator/client-guard.decorator'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ClientService } from '../../../core/service/client.service'
import { CreateClientRequestDto, CreateClientResponseDto } from '../dto/create-client.dto'
import { SyncResponseDto } from '../dto/sync-response.dto'

@Controller('/clients')
@ApiTags('Client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  @AdminGuard()
  @ApiOperation({
    summary: 'Creates a new client'
  })
  @ApiResponse({
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
  @ClientGuard()
  @ApiOperation({
    summary: 'Initiates the data stores synchronization'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SyncResponseDto
  })
  async sync(@ClientId() clientId: string): Promise<SyncResponseDto> {
    try {
      const ok = await this.clientService.syncDataStore(clientId)

      return { ok }
    } catch (error) {
      return { ok: false }
    }
  }
}
