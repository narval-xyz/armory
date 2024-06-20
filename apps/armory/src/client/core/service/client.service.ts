import { secret } from '@narval/nestjs-shared'
import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuid } from 'uuid'
import { Config } from '../../../armory.config'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { ClientRepository } from '../../persistence/repository/client.repository'
import { Client, CreateClient, PolicyEngineNode } from '../type/client.type'

@Injectable()
export class ClientService {
  constructor(
    private clientRepository: ClientRepository,
    private clusterService: ClusterService,
    private configService: ConfigService<Config>
  ) {}

  async findById(id: string): Promise<Client | null> {
    const client = await this.clientRepository.findById(id)

    if (client) {
      const nodes = await this.clusterService.findNodesByClientId(id)

      return this.addNodes(client, nodes)
    }

    return null
  }

  async create(input: CreateClient): Promise<Client & { entityDataUrl: string; policyDataUrl: string }> {
    const now = new Date()
    const clientId = input.id || uuid()

    const plainClientSecret = secret.generate()
    const hashClientSecret = input.clientSecret || secret.hash(plainClientSecret)

    let entityDataStore = input.dataStore.entity
    let policyDataStore = input.dataStore.policy
    let entityDataUrl = entityDataStore.data.url
    let policyDataUrl = policyDataStore.data.url

    const client: Client = {
      id: clientId,
      clientSecret: hashClientSecret,
      dataSecret: null,
      name: input.name,
      dataStore: {
        entityPublicKey: entityDataStore.keys[0],
        policyPublicKey: policyDataStore.keys[0]
      },
      policyEngine: { nodes: [] },
      createdAt: input.createdAt || now,
      updatedAt: input.createdAt || now
    }

    if (input.useManagedDataStore) {
      const res = this.generateDataSecretAndUpdateDataStoreUrl({
        clientId,
        entityDataStore,
        policyDataStore
      })
      client.dataSecret = res.dataSecret
      entityDataStore = res.entityDataStore
      policyDataStore = res.policyDataStore
      entityDataUrl = res.publicEntityDataUrl
      policyDataUrl = res.publicPolicyDataUrl
    }

    const nodes = await this.clusterService.create({
      clientId,
      nodes: input.policyEngine.nodes,
      entityDataStore,
      policyDataStore
    })

    client.policyEngine = { nodes }

    const createdClient = await this.clientRepository.save(client)

    return {
      ...this.addNodes(createdClient, nodes),
      ...(!input.clientSecret && { clientSecret: plainClientSecret }),
      entityDataUrl,
      policyDataUrl
    }
  }

  private addNodes(client: Client, engineNodes: PolicyEngineNode[]): Client {
    const nodes = engineNodes.map(({ id, clientId, publicKey, url }) => ({
      id,
      clientId,
      publicKey,
      url
    }))

    return {
      ...client,
      policyEngine: { nodes }
    }
  }

  private generateDataSecretAndUpdateDataStoreUrl({
    clientId,
    entityDataStore,
    policyDataStore
  }: {
    clientId: string
    entityDataStore: DataStoreConfiguration
    policyDataStore: DataStoreConfiguration
  }) {
    const plainDataSecret = secret.generate()
    const hashDataSecret = secret.hash(plainDataSecret)

    const publicEntityDataUrl = `${this.configService.get('managedDataStoreBaseUrl')}/entities?clientId=${clientId}`
    const publicPolicyDataUrl = `${this.configService.get('managedDataStoreBaseUrl')}/policies?clientId=${clientId}`

    return {
      entityDataStore: this.updateDataStoreUrl(entityDataStore, `${publicEntityDataUrl}&dataSecret=${plainDataSecret}`),
      policyDataStore: this.updateDataStoreUrl(policyDataStore, `${publicPolicyDataUrl}&dataSecret=${plainDataSecret}`),
      dataSecret: hashDataSecret,
      publicEntityDataUrl,
      publicPolicyDataUrl
    }
  }

  private updateDataStoreUrl(dataStore: DataStoreConfiguration, url: string): DataStoreConfiguration {
    return {
      ...dataStore,
      data: { ...dataStore.data, url },
      signature: { ...dataStore.signature, url }
    }
  }
}
