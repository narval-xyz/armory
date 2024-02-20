import { AccountType, WalletEntity, getAddress } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { WalletEntity as WalletModel } from '@prisma/client/armory'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'
import { decodeConstant } from '../decode.util'

@Injectable()
export class WalletRepository {
  constructor(private prismaService: PrismaService) {}

  async create(orgId: string, wallet: WalletEntity): Promise<WalletEntity> {
    await this.prismaService.walletEntity.create({
      data: {
        orgId,
        uid: wallet.uid,
        address: wallet.address,
        accountType: wallet.accountType,
        chainId: wallet.chainId
      }
    })

    return wallet
  }

  async findById(uid: string): Promise<WalletEntity | null> {
    const model = await this.prismaService.walletEntity.findUnique({ where: { uid } })

    if (model) {
      return this.decode(model)
    }

    return null
  }

  async findByOrgId(orgId: string): Promise<WalletEntity[]> {
    const models = await this.prismaService.walletEntity.findMany({
      where: { orgId }
    })

    return models.map(this.decode)
  }

  private decode({ uid, address, accountType, chainId }: WalletModel): WalletEntity {
    return decodeConstant(
      {
        uid,
        address: getAddress(address),
        accountType,
        chainId: chainId || undefined
      },
      'accountType',
      Object.values(AccountType)
    )
  }
}
