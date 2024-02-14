import { AccountClassification, AddressBookAccountEntity, getAddress } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { AddressBookAccountEntity as Model } from '@prisma/client/orchestration'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'
import { decodeConstant } from '../decode.util'

@Injectable()
export class AddressBookRepository {
  constructor(private prismaService: PrismaService) {}

  async create(orgId: string, account: AddressBookAccountEntity): Promise<AddressBookAccountEntity> {
    await this.prismaService.addressBookAccountEntity.create({
      data: { orgId, ...account }
    })

    return account
  }

  async findById(uid: string): Promise<AddressBookAccountEntity | null> {
    const model = await this.prismaService.addressBookAccountEntity.findUnique({
      where: { uid }
    })

    if (model) {
      return this.decode(model)
    }

    return null
  }

  async findByOrgId(orgId: string): Promise<AddressBookAccountEntity[]> {
    const models = await this.prismaService.addressBookAccountEntity.findMany({ where: { orgId } })

    return models.map(this.decode)
  }

  private decode({ uid, address, chainId, classification }: Model): AddressBookAccountEntity {
    return decodeConstant(
      {
        uid,
        address: getAddress(address),
        chainId,
        classification
      },
      'classification',
      Object.values(AccountClassification)
    )
  }
}
