import { PaginatedResult, PaginationOptions, getPaginatedResult, getPaginationQuery } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { ProviderAddress } from '@prisma/client/vault'
import { z } from 'zod'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Provider } from '../../core/type/connection.type'
import { Address } from '../../core/type/indexed-resources.type'

export type FindAllFilters = {
  filters?: {
    externalIds?: string[]
  }
}

@Injectable()
export class AddressRepository {
  constructor(private prismaService: PrismaService) {}

  static getCursorOrderColumns(): Array<keyof ProviderAddress> {
    return ['createdAt']
  }

  static parseModel(model: ProviderAddress): Address {
    const { id, ...rest } = model

    return {
      ...rest,
      addressId: id,
      provider: z.nativeEnum(Provider).parse(model.provider)
    }
  }

  static parseEntity(entity: Address): ProviderAddress {
    return {
      accountId: entity.accountId,
      address: entity.address,
      clientId: entity.clientId,
      createdAt: entity.createdAt,
      externalId: entity.externalId,
      id: entity.addressId,
      provider: entity.provider,
      updatedAt: entity.updatedAt
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
      data: data.map(AddressRepository.parseModel),
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

    return AddressRepository.parseModel(address)
  }

  async findAll(clientId: string, opts?: FindAllFilters): Promise<Address[]> {
    const models = await this.prismaService.providerAddress.findMany({
      where: {
        clientId,
        ...(opts?.filters?.externalIds
          ? {
              externalId: {
                in: opts.filters.externalIds
              }
            }
          : {})
      }
    })

    return models.map(AddressRepository.parseModel)
  }

  async bulkCreate(addresses: Address[]): Promise<Address[]> {
    await this.prismaService.providerAddress.createMany({
      data: addresses.map(AddressRepository.parseEntity)
    })

    return addresses
  }
}
