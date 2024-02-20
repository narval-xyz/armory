import { TokenEntity, getAddress } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { pick } from 'lodash/fp'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class TokenRepository {
  constructor(private prismaService: PrismaService) {}

  async create(orgId: string, tokens: TokenEntity[]): Promise<TokenEntity[]> {
    await this.prismaService.tokenEntity.createMany({
      data: tokens.map((token) => ({ orgId, ...token })),
      skipDuplicates: true
    })

    return tokens
  }

  async findByOrgId(orgId: string): Promise<TokenEntity[]> {
    const entities = await this.prismaService.tokenEntity.findMany({
      where: { orgId }
    })

    return entities.map((entity) => ({
      ...pick(['uid', 'address', 'symbol', 'chainId', 'decimals'], entity),
      address: getAddress(entity.address)
    }))
  }
}
