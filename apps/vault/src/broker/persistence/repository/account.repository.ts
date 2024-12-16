import { PaginatedResult, PaginationOptions, getPaginatedResult, getPaginationQuery } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { ProviderAccount, ProviderAddress } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Account, Address } from '../../core/type/indexed-resources.type'
import { AddressRepository } from './address.repository'

type ProviderAccountAndRelations = ProviderAccount & {
  addresses: ProviderAddress[]
}

type FindAllFilters = {
  filters?: {
    connectionId?: string
    walletId?: string
    externalIds?: string[]
  }
}

export type FindAllPaginatedOptions = PaginationOptions & FindAllFilters

export type FindAllOptions = FindAllFilters

@Injectable()
export class AccountRepository {
  constructor(private prismaService: PrismaService) {}

  static getCursorOrderColumns(): Array<keyof ProviderAccount> {
    return ['createdAt']
  }

  static parseModel(model: ProviderAccountAndRelations): Account {
    const { id, ...rest } = model

    return Account.parse({
      ...rest,
      accountId: id,
      addresses: model.addresses.map(AddressRepository.parseModel)
    })
  }

  static parseEntity(account: Account): ProviderAccount {
    return {
      clientId: account.clientId,
      createdAt: account.createdAt,
      externalId: account.externalId,
      id: account.accountId,
      label: account.label || null,
      networkId: account.networkId,
      provider: account.provider,
      updatedAt: account.updatedAt,
      walletId: account.walletId
    }
  }

  async findByClientId(clientId: string, options?: PaginationOptions): Promise<PaginatedResult<Account>> {
    const pagination = getPaginationQuery({ options, cursorOrderColumns: AccountRepository.getCursorOrderColumns() })

    const result = await this.prismaService.providerAccount.findMany({
      where: { clientId },
      include: {
        addresses: true
      },
      ...pagination
    })
    const { data, page } = getPaginatedResult({ items: result, options: pagination })
    return {
      data: data.map(AccountRepository.parseModel),
      page
    }
  }

  async findById(clientId: string, accountId: string): Promise<Account> {
    const account = await this.prismaService.providerAccount.findUnique({
      where: { clientId, id: accountId },
      include: {
        addresses: true
      }
    })
    if (!account) {
      throw new NotFoundException({
        message: 'Account not found',
        context: { accountId }
      })
    }

    return AccountRepository.parseModel(account)
  }

  async findAddressesByAccountId(
    clientId: string,
    accountId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<Address>> {
    const pagination = getPaginationQuery({ options, cursorOrderColumns: AccountRepository.getCursorOrderColumns() })

    const account = await this.prismaService.providerAccount.findUnique({
      where: { clientId, id: accountId },
      include: {
        addresses: true,
        ...pagination
      }
    })
    if (!account) {
      throw new NotFoundException({
        message: 'Account not found',
        context: { accountId }
      })
    }
    const { data, page } = getPaginatedResult({ items: account.addresses, options: pagination })
    return {
      data: data.map(AddressRepository.parseModel),
      page
    }
  }

  async findAllPaginated(clientId: string, options?: FindAllPaginatedOptions): Promise<PaginatedResult<Account>> {
    const pagination = getPaginationQuery({ options, cursorOrderColumns: AccountRepository.getCursorOrderColumns() })
    const result = await this.prismaService.providerAccount.findMany({
      where: {
        clientId,
        walletId: options?.filters?.walletId,
        wallet: {
          connections: {
            some: {
              connectionId: options?.filters?.connectionId
            }
          }
        }
      },
      include: {
        addresses: true
      },
      ...pagination
    })
    const { data, page } = getPaginatedResult({ items: result, options: pagination })

    return {
      data: data.map(AccountRepository.parseModel),
      page
    }
  }

  async bulkCreate(accounts: Account[]): Promise<Account[]> {
    await this.prismaService.providerAccount.createMany({
      data: accounts.map(AccountRepository.parseEntity)
    })

    return accounts
  }

  async findAll(clientId: string, options?: FindAllOptions): Promise<Account[]> {
    const models = await this.prismaService.providerAccount.findMany({
      where: {
        clientId,
        walletId: options?.filters?.walletId,
        wallet: {
          connections: {
            some: {
              connectionId: options?.filters?.connectionId
            }
          }
        },
        ...(options?.filters?.externalIds
          ? {
              externalId: {
                in: options.filters.externalIds
              }
            }
          : {})
      },
      include: {
        addresses: true
      }
    })

    return models.map(AccountRepository.parseModel)
  }
}
