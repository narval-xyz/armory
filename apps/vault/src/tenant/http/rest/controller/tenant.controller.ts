import { publicKeySchema } from '@narval/signature'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { v4 as uuid } from 'uuid'
import { AdminApiKeyGuard } from '../../../../shared/guard/admin-api-key.guard'
import { TenantService } from '../../../core/service/tenant.service'
import { CreateTenantDto } from '../dto/create-tenant.dto'

@Controller('/tenants')
@UseGuards(AdminApiKeyGuard)
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  async create(@Body() body: CreateTenantDto) {
    const now = new Date()

    const engineJwk = body.engineJwk ? publicKeySchema.parse(body.engineJwk) : undefined // Validate the JWK, instead of in DTO
    const tenant = await this.tenantService.onboard({
      clientId: body.clientId || uuid(),
      clientSecret: randomBytes(42).toString('hex'),
      engineJwk,
      createdAt: now,
      updatedAt: now
    })

    return tenant
  }
}
