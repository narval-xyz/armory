import { AccountType, WalletEntity, getAddress } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
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
    const entity = await this.prismaService.walletEntity.findUnique({ where: { uid } })

    if (entity) {
      return decodeConstant(
        {
          uid: entity.uid,
          address: getAddress(entity.address),
          accountType: entity.accountType,
          chainId: entity.chainId || undefined
        },
        'accountType',
        Object.values(AccountType)
      )
    }

    return null
  }
}
