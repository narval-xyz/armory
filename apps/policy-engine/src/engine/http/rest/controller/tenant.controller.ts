import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { v4 as uuid } from 'uuid'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { AdminApiKeyGuard } from '../../../../shared/guard/admin-api-key.guard'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { TenantService } from '../../../core/service/tenant.service'
import { CreateTenantDto } from '../dto/create-tenant.dto'

@Controller('/tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  @UseGuards(AdminApiKeyGuard)
  async create(@Body() body: CreateTenantDto) {
    const now = new Date()

    const tenant = await this.tenantService.onboard({
      clientId: body.clientId || uuid(),
      clientSecret: randomBytes(42).toString('hex'),
      dataStore: {
        entity: body.entityDataStore,
        policy: body.policyDataStore
      },
      createdAt: now,
      updatedAt: now
    })

    return tenant
  }

  @Post('/sync')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  async sync(@ClientId() clientId: string) {
    try {
      const ok = await this.tenantService.syncDataStore(clientId)

      return { ok }
    } catch (error) {
      return { ok: false }
    }
  }
}
