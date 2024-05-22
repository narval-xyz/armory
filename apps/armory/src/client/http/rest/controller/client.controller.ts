import { ConfigService } from '@narval/config-module'
import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Config } from '../../../../armory.config'
import { ClientService } from '../../../core/service/client.service'
import { CreateClientRequestDto, CreateClientResponseDto } from '../dto/create-client.dto'

@Controller('/clients')
@ApiTags('Client Management')
export class ClientController {
  constructor(
    private clientService: ClientService,
    private configService: ConfigService<Config>
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new client'
  })
  @ApiResponse({
    description: 'The client has been successfully created',
    status: HttpStatus.CREATED,
    type: CreateClientResponseDto
  })
  async create(@Body() body: CreateClientRequestDto): Promise<CreateClientResponseDto> {
    const now = new Date()
    const client = this.clientService.create({
      id: body.id,
      name: body.name,
      dataStore: body.dataStore,
      policyEngine: {
        nodes: body.policyEngineNodes || this.getDefaultPolicyEngineNodes()
      },
      createdAt: now,
      updatedAt: now
    })

    return client
  }

  private getDefaultPolicyEngineNodes() {
    return this.configService.get('policyEngine.nodes').map(({ url }) => url)
  }
}
