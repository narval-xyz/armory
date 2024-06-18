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

    // If we are generating the clientSecret, we'll want to return the full thing to the user one time.
    const fullClientSecret = input.clientSecret || secret.generate()
    const clientSecret = input.clientSecret || secret.hash(fullClientSecret)

    // If we are generating the dataApiKey, we'll want to return the full thing to the user one time.
    const fullDataApiKey = input.dataApiKey || secret.generate()
    const dataApiKey = secret.hash(fullDataApiKey)

    const entityDataStoreUrl = `${input.dataStore.entity.data.url}&dataApiKey=${fullDataApiKey}`
    const entityDataStore: DataStoreConfiguration = {
      ...input.dataStore.entity,
      data: {
        ...input.dataStore.entity.data,
        url: entityDataStoreUrl
      },
      signature: {
        ...input.dataStore.entity.signature,
        url: entityDataStoreUrl
      }
    }

    const policyDataStoreUrl = `${input.dataStore.policy.data.url}&dataApiKey=${fullDataApiKey}`
    const policyDataStore: DataStoreConfiguration = {
      ...input.dataStore.policy,
      data: {
        ...input.dataStore.policy.data,
        url: policyDataStoreUrl
      },
      signature: {
        ...input.dataStore.policy.signature,
        url: policyDataStoreUrl
      }
    }

    const nodes = await this.clusterService.create({
      clientId,
      nodes: input.policyEngine.nodes,
      entityDataStore,
      policyDataStore
    })

    const client = await this.clientRepository.save({
      id: clientId,
      clientSecret,
      dataApiKey,
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
      // If we generated a new secret, we need to include it in the response the first time.
      ...(!input.clientSecret ? { clientSecret: fullClientSecret } : {}),
      ...(!input.dataApiKey ? { dataApiKey: fullDataApiKey } : {})
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
}
