import { Injectable } from '@nestjs/common'
import { compact } from 'lodash/fp'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { tenantIndexSchema, tenantSchema } from '../../../shared/schema/tenant.schema'
import { Tenant } from '../../../shared/type/domain.type'

@Injectable()
export class TenantRepository {
  constructor(private encryptKeyValueService: EncryptKeyValueService) {}

  async findByClientId(clientId: string): Promise<Tenant | null> {
    const value = await this.encryptKeyValueService.get(this.getKey(clientId))

    if (value) {
      return this.decode(value)
    }

    return null
  }

  async save(tenant: Tenant): Promise<Tenant> {
    await this.encryptKeyValueService.set(this.getKey(tenant.clientId), this.encode(tenant))
    await this.index(tenant)

    return tenant
  }

  async getTenantIndex(): Promise<string[]> {
    const index = await this.encryptKeyValueService.get(this.getIndexKey())

    if (index) {
      return this.decodeIndex(index)
    }

    return []
  }

  // TODO: (@wcalderipe, 07/03/24) we need to rethink this strategy. If we use a
  // SQL database, this could generate a massive amount of queries; thus,
  // degrading the performance.
  //
  // An option is to move these general queries `findBy`, findAll`, etc to the
  // KeyValeuRepository implementation letting each implementation pick the best
  // strategy to solve the problem (e.g. where query in SQL)
  async findAll(): Promise<Tenant[]> {
    const ids = await this.getTenantIndex()
    const tenants = await Promise.all(ids.map((id) => this.findByClientId(id)))

    return compact(tenants)
  }

  getKey(clientId: string): string {
    return `tenant:${clientId}`
  }

  getIndexKey(): string {
    return 'tenant:index'
  }

  private async index(tenant: Tenant): Promise<boolean> {
    const currentIndex = await this.getTenantIndex()

    await this.encryptKeyValueService.set(this.getIndexKey(), this.encodeIndex([...currentIndex, tenant.clientId]))

    return true
  }

  private encode(tenant: Tenant): string {
    return EncryptKeyValueService.encode(tenantSchema.parse(tenant))
  }

  private decode(value: string): Tenant {
    return tenantSchema.parse(JSON.parse(value))
  }

  private encodeIndex(value: string[]): string {
    return EncryptKeyValueService.encode(tenantIndexSchema.parse(value))
  }

  private decodeIndex(value: string): string[] {
    return tenantIndexSchema.parse(JSON.parse(value))
  }
}
