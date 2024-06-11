import { publicKeySchema } from '@narval/signature'
import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger'
import { v4 as uuid } from 'uuid'
import { REQUEST_HEADER_API_KEY } from '../../../../main.constant'
import { AdminApiKeyGuard } from '../../../../shared/guard/admin-api-key.guard'
import { ClientService } from '../../../core/service/client.service'
import { ClientDto } from '../dto/client.dto'
import { CreateClientDto } from '../dto/create-client.dto'

@Controller('/clients')
@UseGuards(AdminApiKeyGuard)
@ApiSecurity('ADMIN_API_KEY')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new client'
  })
  @ApiHeader({
    name: REQUEST_HEADER_API_KEY
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ClientDto
  })
  async create(@Body() body: CreateClientDto): Promise<ClientDto> {
    const now = new Date()
    const engineJwk = body.engineJwk ? publicKeySchema.parse(body.engineJwk) : undefined // Validate the JWK, instead of in DTO
    const client = await this.clientService.save({
      clientId: body.clientId || uuid(),
      engineJwk,
      audience: body.audience,
      issuer: body.issuer,
      maxTokenAge: body.maxTokenAge,
      allowKeyExport: body.allowKeyExport,
      backupPublicKey: body.backupPublicKey,
      baseUrl: body.baseUrl,
      createdAt: now,
      updatedAt: now
    })

    return client
  }
}
