import { secret } from '@narval/nestjs-shared'
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
    // If we are generating the secret, we'll want to return the full thing to
    // the user one time.
    const fullClientSecret = input.clientSecret || secret.generate()
    const clientSecret = input.clientSecret || secret.hash(fullClientSecret)

    const nodes = await this.clusterService.create({
      clientId,
      nodes: input.policyEngine.nodes,
      entityDataStore: input.dataStore.entity,
      policyDataStore: input.dataStore.policy
    })

    const client: Client = {
      id: clientId,
      clientSecret,
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

  private addNodes(client: Client, engineNodes: PolicyEngineNode[]): Client {
    const nodes = engineNodes.map(({ clientSecret, ...node }) => node)

    return {
      ...client,
      policyEngine: { nodes }
    }
  }
}
