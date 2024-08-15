import { PublicKey, publicKeySchema } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { DataStoreKey, Client as Model, Prisma } from '@prisma/client/armory'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { Client } from '../../core/type/client.type'

@Injectable()
export class ClientRepository {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string): Promise<Client | null> {
    const model = await this.prismaService.client.findUnique({
      where: { id },
      include: {
        dataStoreKeys: {
          where: {
            deletedAt: null
          }
        }
      }
    })

    if (model) {
      return this.decode(model)
    }

    return null
  }

  async save(client: Client): Promise<Client> {
    const dataStoreKeys = this.encodeDataStoreKeys(client)

    const clientData = this.encode(client)

    await this.prismaService.client.create({
      data: {
        ...clientData,
        dataStoreKeys: {
          createMany: {
            data: dataStoreKeys
          }
        }
      }
    })

    return client
  }

  private decode(
    model: Model & {
      dataStoreKeys: DataStoreKey[]
    }
  ): Client {
    return {
      id: model.id,
      clientSecret: model.clientSecret,
      dataSecret: model.dataSecret,
      name: model.name,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      dataStore: this.decodeDataStoreKeys(model.dataStoreKeys),
      policyEngine: {
        nodes: []
      }
    }
  }

  private decodeDataStoreKeys(model: DataStoreKey[]): { entityPublicKeys: PublicKey[]; policyPublicKeys: PublicKey[] } {
    return {
      entityPublicKeys: model
        .filter((key) => key.storeType === 'entity')
        .map((key) => publicKeySchema.parse(key.publicKey)),
      policyPublicKeys: model
        .filter((key) => key.storeType === 'policy')
        .map((key) => publicKeySchema.parse(key.publicKey))
    }
  }

  private encode(client: Client) {
    return {
      id: client.id,
      clientSecret: client.clientSecret,
      dataSecret: client.dataSecret,
      name: client.name,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      enginePublicKey: publicKeySchema.parse(client.policyEngine.nodes[0].publicKey) as Prisma.InputJsonValue
    }
  }

  private encodeDataStoreKeys(client: Client) {
    const entityDataStoreKeys = client.dataStore.entityPublicKeys.map((key) => ({
      storeType: 'entity',
      publicKey: publicKeySchema.parse(key)
    }))
    const policyDataStoreKeys = client.dataStore.policyPublicKeys.map((key) => ({
      storeType: 'policy',
      publicKey: publicKeySchema.parse(key)
    }))
    const dataStoreKeys = [...entityDataStoreKeys, ...policyDataStoreKeys]
    return dataStoreKeys
  }
}
