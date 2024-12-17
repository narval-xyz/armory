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
    const clientId = body.clientId || uuid()
    const pinnedPublicKeyRaw = body.auth.tokenValidation.pinnedPublicKey || body.engineJwk || undefined
    const pinnedPublicKey = pinnedPublicKeyRaw ? publicKeySchema.parse(pinnedPublicKeyRaw) : undefined // Validate the JWK, instead of in DTO

    const client = await this.clientService.save({
      clientId,
      name: body.name || clientId,
      backupPublicKey: body.backupPublicKey || null,
      baseUrl: body.baseUrl || null,
      configurationSource: 'dynamic',
      auth: {
        disabled: false, // We DO NOT allow dynamic clients to have no auth; use declarative client if you need a no-auth deployment
        local: {
          jwsd: {
            maxAge: body.auth.local?.jwsd?.maxAge || 300,
            requiredComponents: body.auth.local?.jwsd?.requiredComponents || ['htm', 'uri', 'created', 'ath']
          },
          allowedUsersJwksUrl: null, // Not implemented, so we set to null
          allowedUsers: body.auth.local?.allowedUsers || null
        },
        tokenValidation: {
          disabled: body.auth.tokenValidation.disabled,
          url: body.auth.tokenValidation.url || null,
          jwksUrl: null, // Not implemented, so we set to null
          pinnedPublicKey: pinnedPublicKey || null,
          verification: {
            audience: body.auth.tokenValidation.verification.audience || body.audience || null,
            issuer: body.auth.tokenValidation.verification.issuer || body.issuer || null,
            maxTokenAge: body.auth.tokenValidation.verification.maxTokenAge || body.maxTokenAge || null,
            requireBoundTokens: body.auth.tokenValidation.verification.requireBoundTokens, // Default to True
            allowBearerTokens: body.auth.tokenValidation.verification.allowBearerTokens, // Defaults to False
            allowWildcard: body.auth.tokenValidation.verification.allowWildcard || body.allowWildcard || null
          }
        }
      },
      createdAt: now,
      updatedAt: now
    })

    return client
  }
}
