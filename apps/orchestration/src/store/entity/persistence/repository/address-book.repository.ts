import { AccountClassification, AddressBookAccountEntity, getAddress } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
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
    const entity = await this.prismaService.addressBookAccountEntity.findUnique({
      where: { uid }
    })

    if (entity) {
      return decodeConstant(
        {
          uid: entity.uid,
          address: getAddress(entity.address),
          chainId: entity.chainId,
          classification: entity.classification
        },
        'classification',
        Object.values(AccountClassification)
      )
    }

    return null
  }
}
