import { publicKeySchema } from '@narval/signature'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { v4 as uuid } from 'uuid'
import { AdminApiKeyGuard } from '../../../../shared/guard/admin-api-key.guard'
import { ClientService } from '../../../core/service/client.service'
import { CreateClientDto } from '../dto/create-client.dto'

@Controller('/clients')
@UseGuards(AdminApiKeyGuard)
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  async create(@Body() body: CreateClientDto) {
    const now = new Date()

    const engineJwk = body.engineJwk ? publicKeySchema.parse(body.engineJwk) : undefined // Validate the JWK, instead of in DTO
    const client = await this.clientService.save({
      clientId: body.clientId || uuid(),
      clientSecret: randomBytes(42).toString('hex'),
      engineJwk,
      audience: body.audience,
      issuer: body.issuer,
      maxTokenAge: body.maxTokenAge,
      baseUrl: body.baseUrl,
      createdAt: now,
      updatedAt: now
    })

    return client
  }
}
