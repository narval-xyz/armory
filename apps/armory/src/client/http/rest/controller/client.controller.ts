import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../core/service/client.service'
import { CreateClientRequestDto, CreateClientResponseDto } from '../dto/create-client.dto'

@Controller('/clients')
@ApiTags('Client Management')
export class ClientController {
  constructor(private clientService: ClientService) {}

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

    const client = this.clientService.save({
      id: uuid(),
      name: body.clientName,
      dataStore: {
        entityPublicKey: body.entityStorePublicKey,
        policyPublicKey: body.policyStorePublicKey
      },
      createdAt: now,
      updatedAt: now
    })

    return client
  }
}
