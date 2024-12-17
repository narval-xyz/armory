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
      name: clientId,
      backupPublicKey: null,
      baseUrl: body.baseUrl || null,
      configurationSource: 'dynamic',
      auth: {
        disabled: false,
        local: {
          jwsd: {
            maxAge: 300,
            requiredComponents: ['htm', 'uri', 'created', 'ath']
          },
          allowedUsersJwksUrl: null,
          allowedUsers: null
        },
        tokenValidation: {
          disabled: false,
          url: null,
          jwksUrl: null,
          pinnedPublicKey: engineJwk || null,
          verification: {
            audience: body.audience || null,
            issuer: body.issuer || null,
            maxTokenAge: body.maxTokenAge || null,
            requireBoundTokens: true,
            allowBearerTokens: false,
            allowWildcard: body.allowWildcard || null
          }
        }
      },
      createdAt: now,
      updatedAt: now
    })

    return client
  }
}
