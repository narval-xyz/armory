import { EntityStore, PolicyStore, entityStoreSchema, policyStoreSchema } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { compact } from 'lodash/fp'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { tenantIndexSchema, tenantSchema } from '../../../shared/schema/tenant.schema'
import { EngineSignerConfig, Tenant } from '../../../shared/type/domain.type'

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

  async saveEntityStore(clientId: string, store: EntityStore): Promise<boolean> {
    return this.encryptKeyValueService.set(this.getEntityStoreKey(clientId), this.encodeEntityStore(store))
  }

  async findEntityStore(clientId: string): Promise<EntityStore | null> {
    const value = await this.encryptKeyValueService.get(this.getEntityStoreKey(clientId))

    if (value) {
      return this.decodeEntityStore(value)
    }

    return null
  }

  async savePolicyStore(clientId: string, store: PolicyStore): Promise<boolean> {
    return this.encryptKeyValueService.set(this.getPolicyStoreKey(clientId), this.encodePolicyStore(store))
  }

  async findPolicyStore(clientId: string): Promise<PolicyStore | null> {
    const value = await this.encryptKeyValueService.get(this.getPolicyStoreKey(clientId))

    if (value) {
      return this.decodePolicyStore(value)
    }

    return null
  }

  async findSignerConfigKey(): Promise<EngineSignerConfig | null> {
    const value = await this.encryptKeyValueService.get(this.getSignerConfigKey())

    if (value) {
      return JSON.parse(value)
    }

    return null
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

  async clear(): Promise<boolean> {
    try {
      const ids = await this.getTenantIndex()
      await Promise.all(ids.map((id) => this.encryptKeyValueService.delete(id)))

      return true
    } catch {
      return false
    }
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

  getSignerConfigKey(): string {
    return `engine:${process.env.ENGINE_UID}:signer-config`
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

  private encodeEntityStore(value: EntityStore): string {
    return EncryptKeyValueService.encode(entityStoreSchema.parse(value))
  }

  private decodeEntityStore(value: string): EntityStore {
    return entityStoreSchema.parse(JSON.parse(value))
  }

  private encodePolicyStore(value: PolicyStore): string {
    return EncryptKeyValueService.encode(policyStoreSchema.parse(value))
  }

  private decodePolicyStore(value: string): PolicyStore {
    return policyStoreSchema.parse(JSON.parse(value))
  }
}
