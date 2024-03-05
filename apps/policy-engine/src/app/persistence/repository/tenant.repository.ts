import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { tenantSchema } from '../../../shared/schema/tenant.schema'
import { Tenant } from '../../../shared/type/domain.type'

@Injectable()
export class TenantRepository {
  constructor(private keyValueService: KeyValueService) {}

  async findByClientId(clientId: string): Promise<Tenant | null> {
    const value = await this.keyValueService.get(this.getKey(clientId))

    if (value) {
      return this.decode(value)
    }

    return null
  }

  async create(tenant: Tenant): Promise<Tenant> {
    await this.keyValueService.set(this.getKey(tenant.clientId), this.encode(tenant))

    return tenant
  }

  getKey(clientId: string): string {
    return `tenant:${clientId}`
  }

  private encode(tenant: Tenant): string {
    return JSON.stringify(tenant)
  }

  private decode(value: string): Tenant {
    return tenantSchema.parse(JSON.parse(value))
  }
}
