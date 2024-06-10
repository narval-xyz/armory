import { publicKeySchema } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { Client as Model, Prisma } from '@prisma/client/armory'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { Client } from '../../core/type/client.type'

@Injectable()
export class ClientRepository {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string): Promise<Client | null> {
    const model = await this.prismaService.client.findUnique({
      where: { id }
    })

    if (model) {
      return this.decode(model)
    }

    return null
  }

  async save(client: Client): Promise<Client> {
    await this.prismaService.client.create({
      data: this.encode(client)
    })

    return client
  }

  private decode(model: Model): Client {
    return {
      id: model.id,
      clientSecret: model.clientSecret,
      name: model.name,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      dataStore: {
        entityPublicKey: publicKeySchema.parse(model.entityPublicKey),
        policyPublicKey: publicKeySchema.parse(model.policyPublicKey)
      },
      policyEngine: {
        nodes: []
      }
    }
  }

  private encode(client: Client) {
    return {
      id: client.id,
      clientSecret: client.clientSecret,
      name: client.name,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      enginePublicKey: publicKeySchema.parse(client.dataStore.entityPublicKey) as Prisma.InputJsonValue,
      entityPublicKey: publicKeySchema.parse(client.dataStore.entityPublicKey) as Prisma.InputJsonValue,
      policyPublicKey: publicKeySchema.parse(client.dataStore.policyPublicKey) as Prisma.InputJsonValue
    }
  }
}
