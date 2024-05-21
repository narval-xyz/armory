import { publicKeySchema } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { Engine, Prisma } from '@prisma/client/armory'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { PolicyEngineNode } from '../../core/type/cluster.type'

@Injectable()
export class PolicyEngineNodeRepository {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string): Promise<PolicyEngineNode | null> {
    const model = await this.prismaService.engine.findUnique({
      where: { id }
    })

    if (model) {
      return this.decode(model)
    }

    return null
  }

  async findByUrl(url: string): Promise<PolicyEngineNode[]> {
    const models = await this.prismaService.engine.findMany({
      where: { url }
    })

    return models.map(this.decode)
  }

  async findByClientId(clientId: string): Promise<PolicyEngineNode[]> {
    const models = await this.prismaService.engine.findMany({
      where: { clientId }
    })

    return models.map(this.decode)
  }

  async bulkCreate(nodes: PolicyEngineNode[]): Promise<PolicyEngineNode[]> {
    await this.prismaService.engine.createMany({
      data: nodes.map(this.encode)
    })

    return nodes
  }

  private decode(model: Engine) {
    return {
      id: model.id,
      url: model.url,
      clientId: model.clientId,
      clientSecret: model.clientSecret,
      publicKey: publicKeySchema.parse(model.publicKey)
    }
  }

  private encode(node: PolicyEngineNode) {
    return {
      id: node.id,
      url: node.url,
      clientId: node.clientId,
      clientSecret: node.clientSecret,
      publicKey: node.publicKey as Prisma.InputJsonValue
    }
  }
}
