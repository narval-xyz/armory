import { PaginatedResult, PaginationOptions, applyPagination, getPaginatedResult } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { ProviderAddress } from '@prisma/client/vault'
import { z } from 'zod'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Address } from '../../core/type/indexed-resources.type'
import { Provider } from '../../core/type/provider.type'

type FindAllFilters = {
  filters?: {
    externalIds?: string[]
    addresses?: string[]
    provider?: Provider
  }
}

export type FindAllOptions = FindAllFilters & { pagination?: PaginationOptions }

@Injectable()
export class AddressRepository {
  constructor(private prismaService: PrismaService) {}

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

  async findByClientId(clientId: string, opts?: PaginationOptions): Promise<PaginatedResult<Address>> {
    const pagination = applyPagination(opts)

    const result = await this.prismaService.providerAddress.findMany({
      where: { clientId },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: result, pagination })
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

  async findAll(clientId: string, opts?: FindAllOptions): Promise<PaginatedResult<Address>> {
    const pagination = applyPagination(opts?.pagination)

    const models = await this.prismaService.providerAddress.findMany({
      where: {
        clientId,
        ...(opts?.filters?.provider
          ? {
              provider: opts.filters.provider
            }
          : {}),
        ...(opts?.filters?.addresses
          ? {
              address: {
                in: opts.filters.addresses
              }
            }
          : {}),
        ...(opts?.filters?.externalIds
          ? {
              externalId: {
                in: opts.filters.externalIds
              }
            }
          : {})
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: models, pagination })

    return {
      data: data.map(AddressRepository.parseModel),
      page
    }
  }

  async bulkCreate(addresses: Address[]): Promise<Address[]> {
    await this.prismaService.providerAddress.createMany({
      data: addresses.map(AddressRepository.parseEntity)
    })

    return addresses
  }
}
