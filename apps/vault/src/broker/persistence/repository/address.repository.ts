import { PaginatedResult, PaginationOptions, getPaginatedResult, getPaginationQuery } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { ProviderAddress } from '@prisma/client/vault'
import { z } from 'zod'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Provider } from '../../core/type/connection.type'
import { Address } from '../../core/type/indexed-resources.type'

@Injectable()
export class AddressRepository {
  constructor(private prismaService: PrismaService) {}

  static getCursorOrderColumns(): Array<keyof ProviderAddress> {
    return ['createdAt']
  }

  static map(address: ProviderAddress): Address {
    return {
      ...address,
      provider: z.nativeEnum(Provider).parse(address.provider),
      addressId: address.id
    }
  }

  async findByClientId(clientId: string, options?: PaginationOptions): Promise<PaginatedResult<Address>> {
    const pagination = getPaginationQuery({ options, cursorOrderColumns: AddressRepository.getCursorOrderColumns() })

    const result = await this.prismaService.providerAddress.findMany({
      where: { clientId },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: result, options: pagination })
    return {
      data: data.map(AddressRepository.map),
      page
    }
  }

  async findById(clientId: string, addressId: string): Promise<Address> {
    const address = await this.prismaService.providerAddress.findUnique({
      where: { clientId, id: addressId }
    })
    if (!address) {
      throw new NotFoundException({
        message: 'Address not found',
        context: { addressId }
      })
    }

    return AddressRepository.map(address)
  }
}
