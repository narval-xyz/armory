import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../persistence/service/prisma.service'
import { KeyMetadata, KeyValueRepository } from '../../core/repository/key-value.repository'

@Injectable()
export class PrismaKeyValueRepository implements KeyValueRepository {
  constructor(private prismaService: PrismaService) {}

  async find(metadata: KeyMetadata): Promise<string[] | null> {
    const models = await this.prismaService.keyValue.findMany({
      where: { collection: metadata.collection, clientId: metadata.clientId }
    })

    return models.map((model) => model.value)
  }

  async get(key: string): Promise<string | null> {
    const model = await this.prismaService.keyValue.findUnique({
      where: { key }
    })

    if (model) {
      return model.value
    }

    return null
  }

  async set(key: string, value: string, metadata: KeyMetadata): Promise<boolean> {
    try {
      await this.prismaService.keyValue.upsert({
        where: { key },
        create: { key, value, collection: metadata.collection, clientId: metadata.clientId },
        update: { value }
      })

      return true
    } catch (error) {
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.prismaService.keyValue.delete({
        where: { key }
      })

      return true
    } catch (error) {
      return false
    }
  }
}
