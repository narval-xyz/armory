import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiAdminGuard } from '../../../../shared/decorator/api-admin-guard.decorator'
import { ClientService } from '../../../core/service/client.service'
import { CreateClientRequestDto, CreateClientResponseDto } from '../dto/create-client.dto'

@Controller({
  path: 'clients',
  version: '1'
})
@ApiTags('Client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  @ApiAdminGuard()
  @ApiOperation({
    summary: 'Creates a new client'
  })
  @ApiResponse({
    description: 'The client has been successfully created',
    status: HttpStatus.CREATED,
    type: CreateClientResponseDto
  })
  async create(@Body() body: CreateClientRequestDto): Promise<CreateClientResponseDto> {
    const client = this.clientService.create(body)

    return client
  }
}
