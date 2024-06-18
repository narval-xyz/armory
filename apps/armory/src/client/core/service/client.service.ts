import { secret } from '@narval/nestjs-shared'
import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { ClientRepository } from '../../persistence/repository/client.repository'
import { Client, CreateClient, PolicyEngineNode } from '../type/client.type'

@Injectable()
export class ClientService {
  constructor(
    private clientRepository: ClientRepository,
    private clusterService: ClusterService
  ) {}

  async findById(id: string): Promise<Client | null> {
    const client = await this.clientRepository.findById(id)

    if (client) {
      const nodes = await this.clusterService.findNodesByClientId(id)

      return this.addNodes(client, nodes)
    }

    return null
  }

  async create(input: CreateClient): Promise<Client> {
    const now = new Date()
    const clientId = input.id || uuid()

    const plainClientSecret = input.clientSecret || secret.generate()
    const hashClientSecret = secret.hash(plainClientSecret)

    const plainDataSecret = input.dataSecret || secret.generate()
    const hashDataSecret = secret.hash(plainDataSecret)

    const entityDataStore = this.updateDataStoreUrl(input.dataStore.entity, plainDataSecret)
    const policyDataStore = this.updateDataStoreUrl(input.dataStore.policy, plainDataSecret)

    const nodes = await this.clusterService.create({
      clientId,
      nodes: input.policyEngine.nodes,
      entityDataStore,
      policyDataStore
    })

    const client = await this.clientRepository.save({
      id: clientId,
      clientSecret: hashClientSecret,
      dataSecret: hashDataSecret,
      name: input.name,
      dataStore: {
        entityPublicKey: input.dataStore.entity.keys[0],
        policyPublicKey: input.dataStore.policy.keys[0]
      },
      createdAt: input.createdAt || now,
      updatedAt: input.createdAt || now,
      policyEngine: { nodes }
    })

    return {
      ...this.addNodes(client, nodes),
      clientSecret: plainClientSecret,
      dataSecret: plainDataSecret
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

  private updateDataStoreUrl(dataStore: DataStoreConfiguration, dataSecret: string): DataStoreConfiguration {
    const url = `${dataStore.data.url}&dataSecret=${dataSecret}`

    return {
      ...dataStore,
      data: {
        ...dataStore.data,
        url
      },
      signature: {
        ...dataStore.signature,
        url
      }
    }
  }
}
