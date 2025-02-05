import { coerce } from '@narval/nestjs-shared'
import { EntityStore, PolicyStore } from '@narval/policy-engine-shared'
import { privateKeySchema } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client/policy-engine'
import { compact } from 'lodash/fp'
import { SigningAlg, publicKeySchema } from 'packages/signature/src/lib/types'
import { z } from 'zod'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { Client, ClientV1 } from '../../../shared/type/domain.type'

const ClientListIndex = z.array(z.string())

export function clientObjectToPrisma(client: Client): Prisma.ClientCreateInput {
  return {
    clientId: client.clientId,
    name: client.name,
    configurationSource: client.configurationSource,
    baseUrl: client.baseUrl,
    authDisabled: client.auth.disabled,
    clientSecret: client.auth.local?.clientSecret,

    dataStoreEntityDataUrl: client.dataStore.entity.data.url,
    dataStoreEntitySignatureUrl: client.dataStore.entity.signature.url,
    dataStoreEntityPublicKeys: JSON.stringify(client.dataStore.entity.keys),
    dataStorePolicyDataUrl: client.dataStore.policy.data.url,
    dataStorePolicySignatureUrl: client.dataStore.policy.signature.url,
    dataStorePolicyPublicKeys: JSON.stringify(client.dataStore.policy.keys),

    decisionAttestationDisabled: client.decisionAttestation.disabled,
    signerAlg: client.decisionAttestation.signer?.alg,
    signerKeyId: client.decisionAttestation.signer?.keyId,
    signerPublicKey: JSON.stringify(client.decisionAttestation.signer?.publicKey),
    signerPrivateKey: JSON.stringify(client.decisionAttestation.signer?.privateKey),

    createdAt: client.createdAt,
    updatedAt: client.updatedAt
  }
}

function prismaToClientObject(prismaClient: Prisma.ClientGetPayload<undefined>): Client {
  return Client.parse({
    clientId: prismaClient.clientId,
    name: prismaClient.name,
    configurationSource: prismaClient.configurationSource as 'declarative' | 'dynamic',
    baseUrl: prismaClient.baseUrl,
    auth: {
      disabled: prismaClient.authDisabled,
      local: prismaClient.clientSecret
        ? {
            clientSecret: prismaClient.clientSecret
          }
        : null
    },
    dataStore: {
      entity: {
        data: {
          url: prismaClient.dataStoreEntityDataUrl,
          type: prismaClient.dataStoreEntityDataUrl.startsWith('https') ? 'HTTPS' : 'HTTP'
        },
        signature: {
          url: prismaClient.dataStoreEntitySignatureUrl,
          type: prismaClient.dataStoreEntitySignatureUrl.startsWith('https') ? 'HTTPS' : 'HTTP'
        },
        keys: JSON.parse(prismaClient.dataStoreEntityPublicKeys)
      },
      policy: {
        data: {
          url: prismaClient.dataStorePolicyDataUrl,
          type: prismaClient.dataStorePolicyDataUrl.startsWith('https') ? 'HTTPS' : 'HTTP'
        },
        signature: {
          url: prismaClient.dataStorePolicySignatureUrl,
          type: prismaClient.dataStorePolicySignatureUrl.startsWith('https') ? 'HTTPS' : 'HTTP'
        },
        keys: JSON.parse(prismaClient.dataStorePolicyPublicKeys)
      }
    },
    decisionAttestation: {
      disabled: prismaClient.decisionAttestationDisabled,
      signer: prismaClient.signerAlg
        ? {
            alg: prismaClient.signerAlg as SigningAlg,
            keyId: prismaClient.signerKeyId,
            publicKey: prismaClient.signerPublicKey
              ? publicKeySchema.parse(JSON.parse(prismaClient.signerPublicKey))
              : undefined,
            privateKey: prismaClient.signerPrivateKey
              ? privateKeySchema.parse(JSON.parse(prismaClient.signerPrivateKey))
              : undefined
          }
        : null
    },
    createdAt: prismaClient.createdAt,
    updatedAt: prismaClient.updatedAt
  })
}

@Injectable()
export class ClientRepository {
  constructor(
    private encryptKeyValueService: EncryptKeyValueService,
    private prismaService: PrismaService
  ) {}

  async findById(clientId: string): Promise<Client | null> {
    const value = await this.prismaService.client.findUnique({
      where: { clientId }
    })

    if (value) {
      return prismaToClientObject(value)
    }

    return null
  }
  async findAll(): Promise<Client[]> {
    const clients = await this.prismaService.client.findMany({})
    return clients.map(prismaToClientObject)
  }

  // Upsert the Client
  async save(client: Client): Promise<Client> {
    const clientData = clientObjectToPrisma(client)

    await this.prismaService.client.upsert({
      where: { clientId: client.clientId },
      update: clientData,
      create: clientData
    })

    return client
  }

  /** @deprecated */
  async findByIdV1(clientId: string): Promise<ClientV1 | null> {
    const value = await this.encryptKeyValueService.get(this.getKey(clientId))

    if (value) {
      return coerce.decode(ClientV1, value)
    }

    return null
  }

  /** @deprecated */
  async saveV1(client: ClientV1): Promise<ClientV1> {
    await this.encryptKeyValueService.set(this.getKey(client.clientId), coerce.encode(ClientV1, client))
    await this.index(client)

    return client
  }

  /** @deprecated */
  async getClientListIndex(): Promise<string[]> {
    const index = await this.encryptKeyValueService.get(this.getIndexKey())

    if (index) {
      return coerce.decode(ClientListIndex, index)
    }

    return []
  }

  async saveEntityStore(clientId: string, store: EntityStore): Promise<boolean> {
    return this.encryptKeyValueService.set(this.getEntityStoreKey(clientId), coerce.encode(EntityStore, store))
  }

  async findEntityStore(clientId: string): Promise<EntityStore | null> {
    const value = await this.encryptKeyValueService.get(this.getEntityStoreKey(clientId))

    if (value) {
      return coerce.decode(EntityStore, value)
    }

    return null
  }

  async savePolicyStore(clientId: string, store: PolicyStore): Promise<boolean> {
    return this.encryptKeyValueService.set(this.getPolicyStoreKey(clientId), coerce.encode(PolicyStore, store))
  }

  async findPolicyStore(clientId: string): Promise<PolicyStore | null> {
    const value = await this.encryptKeyValueService.get(this.getPolicyStoreKey(clientId))

    if (value) {
      return coerce.decode(PolicyStore, value)
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
  /** @deprecated */
  async findAllV1(): Promise<ClientV1[]> {
    const ids = await this.getClientListIndex()
    const clients = await Promise.all(ids.map((id) => this.findByIdV1(id)))

    return compact(clients)
  }

  /** @deprecated */
  getKey(clientId: string): string {
    return `client:${clientId}`
  }

  /** @deprecated */
  getIndexKey(): string {
    return 'client:list-index'
  }

  /** @deprecated */
  private async index(client: ClientV1): Promise<boolean> {
    const currentIndex = await this.getClientListIndex()

    await this.encryptKeyValueService.set(
      this.getIndexKey(),
      coerce.encode(ClientListIndex, [...currentIndex, client.clientId])
    )

    return true
  }

  getEntityStoreKey(clientId: string): string {
    return `client:${clientId}:entity-store`
  }

  getPolicyStoreKey(clientId: string): string {
    return `client:${clientId}:policy-store`
  }

  async deleteV1(clientId: string): Promise<void> {
    await this.encryptKeyValueService.delete(this.getKey(clientId))
    // Remove the client from the index
    const currentIndex = await this.getClientListIndex()

    const newIndex = currentIndex.filter((id) => id !== clientId)
    await this.encryptKeyValueService.set(this.getIndexKey(), coerce.encode(ClientListIndex, newIndex))
  }
}
