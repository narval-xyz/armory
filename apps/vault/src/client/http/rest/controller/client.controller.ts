import { publicKeySchema } from '@narval/signature'
import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { v4 as uuid } from 'uuid'
import { AdminGuard } from '../../../../shared/decorator/admin-guard.decorator'
import { ClientService } from '../../../core/service/client.service'
import { ClientDto } from '../dto/client.dto'
import { CreateClientDto } from '../dto/create-client.dto'

@Controller({
  path: '/clients',
  version: '1'
})
@ApiTags('Client')
@AdminGuard()
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new client'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ClientDto
  })
  async create(@Body() body: CreateClientDto): Promise<ClientDto> {
    const now = new Date()
    const engineJwk = body.engineJwk ? publicKeySchema.parse(body.engineJwk) : undefined // Validate the JWK, instead of in DTO
    const clientId = body.clientId || uuid()

    const client = await this.clientService.save({
      clientId,
      engineJwk,
      audience: body.audience,
      issuer: body.issuer,
      maxTokenAge: body.maxTokenAge,
      allowKeyExport: body.allowKeyExport,
      allowWildcard: body.allowWildcard,
      backupPublicKey: body.backupPublicKey,
      baseUrl: body.baseUrl,
      createdAt: now,
      updatedAt: now
    })

    return client
  }
}
