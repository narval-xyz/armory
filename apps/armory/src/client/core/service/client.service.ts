import { ConfigService } from '@narval/config-module'
import { secret } from '@narval/nestjs-shared'
import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { Config } from '../../../armory.config'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { ClientRepository } from '../../persistence/repository/client.repository'
import { Client, CreateClientInput, PolicyEngineNode, PublicClient } from '../type/client.type'

@Injectable()
export class ClientService {
  constructor(
    private clientRepository: ClientRepository,
    private clusterService: ClusterService,
    private configService: ConfigService<Config>
  ) {}

  async findById(id: string): Promise<PublicClient | null> {
    const client = await this.clientRepository.findById(id)

    if (client) {
      const nodes = await this.clusterService.findNodesByClientId(id)

      return this.buildPublicClient({ client, nodes })
    }

    return null
  }

  async create(input: CreateClientInput): Promise<PublicClient> {
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
        entityPublicKeys: entityDataStore.keys,
        policyPublicKeys: policyDataStore.keys
      },
      policyEngine: { nodes: [] },
      createdAt: now,
      updatedAt: now
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
      nodes: input.policyEngineNodes || this.getDefaultPolicyEngineNodes(),
      entityDataStore,
      policyDataStore,
      allowSelfSignedData: input.dataStore.allowSelfSignedData
    })

    client.policyEngine = { nodes }

    // If we configured engine to include it's own key in the datastore signers, then we will track that here as well.
    if (input.dataStore.allowSelfSignedData) {
      client.dataStore.entityPublicKeys.push(nodes[0].publicKey)
      client.dataStore.policyPublicKeys.push(nodes[0].publicKey)
    }

    const createdClient = await this.clientRepository.save(client)

    // Trigger a cluster data sync, since we likely _just_ created the datastore.
    await this.clusterService.sync(clientId)

    return {
      ...this.buildPublicClient({
        client: createdClient,
        entityDataUrl,
        policyDataUrl,
        nodes
      }),
      // Return the plain client secret only if it was generated
      ...(!input.clientSecret && { clientSecret: plainClientSecret }),
      dataSecret: null
    }
  }

  private buildPublicClient({
    client,
    entityDataUrl,
    policyDataUrl,
    nodes
  }: {
    client: Client
    nodes: PolicyEngineNode[]
    entityDataUrl?: string
    policyDataUrl?: string
  }): PublicClient {
    const dataStore = {
      ...client.dataStore,
      ...(entityDataUrl && { entityDataUrl }),
      ...(policyDataUrl && { policyDataUrl })
    }

    const publicEngineNodes = nodes.map(({ id, clientId, publicKey, url }) => ({
      id,
      clientId,
      publicKey,
      url
    }))

    return {
      ...client,
      dataStore,
      policyEngine: {
        nodes: publicEngineNodes
      }
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

  private getDefaultPolicyEngineNodes() {
    return this.configService.get('policyEngine.nodes').map(({ url }) => url)
  }
}
