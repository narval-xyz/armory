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

    const nodes = await this.clusterService.create({
      clientId,
      nodes: input.policyEngine.nodes,
      // TODO: Use the same data structure from the input
      entityDataStore: input.dataStore.entity,
      policyDataStore: input.dataStore.policy
    })

    const client: Client = {
      id: clientId,
      name: input.name,
      dataStore: {
        entityPublicKey: input.dataStore.entity.keys[0],
        policyPublicKey: input.dataStore.policy.keys[0]
      },
      createdAt: input.createdAt || now,
      updatedAt: input.createdAt || now,
      policyEngine: { nodes }
    }

    await this.clientRepository.save(client)

    return this.addNodes(client, nodes)
  }

  private addNodes(client: Client, nodes: PolicyEngineNode[]): Client {
    return {
      ...client,
      policyEngine: { nodes }
    }
  }
}
