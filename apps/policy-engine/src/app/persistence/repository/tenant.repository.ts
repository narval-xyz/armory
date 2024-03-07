import { EntityStore, PolicyStore, entityStoreSchema, policyStoreSchema } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { tenantIndexSchema, tenantSchema } from '../../../shared/schema/tenant.schema'
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

  async save(tenant: Tenant): Promise<Tenant> {
    await this.keyValueService.set(this.getKey(tenant.clientId), this.encode(tenant))
    await this.index(tenant)

    return tenant
  }

  private async index(tenant: Tenant): Promise<boolean> {
    const currentIndex = await this.getTenantIndex()

    await this.keyValueService.set(this.getIndexKey(), this.encodeIndex([...currentIndex, tenant.clientId]))

    return true
  }

  async getTenantIndex(): Promise<string[]> {
    const index = await this.keyValueService.get(this.getIndexKey())

    if (index) {
      return this.decodeIndex(index)
    }

    return []
  }

  saveEntityStore(clientId: string, store: EntityStore): Promise<boolean> {
    return this.keyValueService.set(this.getEntityStoreKey(clientId), this.encodeEntityStore(store))
  }

  async findEntityStore(clientId: string): Promise<EntityStore | null> {
    const value = await this.keyValueService.get(this.getEntityStoreKey(clientId))

    if (value) {
      return this.decodeEntityStore(value)
    }

    return null
  }

  savePolicyStore(clientId: string, store: PolicyStore): Promise<boolean> {
    return this.keyValueService.set(this.getPolicyStoreKey(clientId), this.encodePolicyStore(store))
  }

  async findPolicyStore(clientId: string): Promise<PolicyStore | null> {
    const value = await this.keyValueService.get(this.getPolicyStoreKey(clientId))

    if (value) {
      return this.decodePolicyStore(value)
    }

    return null
  }

  getKey(clientId: string): string {
    return `tenant:${clientId}`
  }

  getIndexKey(): string {
    return 'tenant:index'
  }

  getEntityStoreKey(clientId: string): string {
    return `tenant:${clientId}:entity-store`
  }

  getPolicyStoreKey(clientId: string): string {
    return `tenant:${clientId}:policy-store`
  }

  private encode(tenant: Tenant): string {
    return KeyValueService.encode(tenantSchema.parse(tenant))
  }

  private decode(value: string): Tenant {
    return tenantSchema.parse(JSON.parse(value))
  }

  private encodeIndex(value: string[]): string {
    return KeyValueService.encode(tenantIndexSchema.parse(value))
  }

  private decodeIndex(value: string): string[] {
    return tenantIndexSchema.parse(JSON.parse(value))
  }

  private encodeEntityStore(value: EntityStore): string {
    return KeyValueService.encode(entityStoreSchema.parse(value))
  }

  private decodeEntityStore(value: string): EntityStore {
    return entityStoreSchema.parse(JSON.parse(value))
  }

  private encodePolicyStore(value: PolicyStore): string {
    return KeyValueService.encode(policyStoreSchema.parse(value))
  }

  private decodePolicyStore(value: string): PolicyStore {
    return policyStoreSchema.parse(JSON.parse(value))
  }
}
