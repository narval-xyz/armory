import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../persistence/service/prisma.service'
import { KeyValueRepository } from '../../core/repository/key-value.repository'

@Injectable()
export class PrismaKeyValueRepository implements KeyValueRepository {
  constructor(private prismaService: PrismaService) {}

  async get(key: string): Promise<string | null> {
    const model = await this.prismaService.keyValue.findUnique({
      where: { key }
    })

    if (model) {
      return model.value
    }

    return null
  }

  async set(key: string, value: string): Promise<boolean> {
    try {
      await this.prismaService.keyValue.upsert({
        where: { key },
        create: { key, value },
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
