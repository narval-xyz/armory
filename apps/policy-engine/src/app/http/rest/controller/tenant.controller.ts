import { Body, Controller, Post } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { v4 as uuid } from 'uuid'
import { TenantService } from '../../../core/service/tenant.service'
import { CreateTenantDto } from '../dto/create-tenant.dto'

@Controller('/tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  async create(@Body() body: CreateTenantDto) {
    const now = new Date()

    const tenant = await this.tenantService.create({
      clientId: body.clientId || uuid(),
      clientSecret: randomBytes(42).toString('hex'),
      dataStore: {
        entity: {
          ...body.entityDataStore,
          keys: []
        },
        policy: {
          ...body.policyDataStore,
          keys: []
        }
      },
      createdAt: now,
      updatedAt: now
    })

    return tenant
  }
}
