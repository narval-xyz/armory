import { PaginatedResult, PaginationOptions, applyPagination, getPaginatedResult } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { ProviderAccount, ProviderAddress } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Account, Address } from '../../core/type/indexed-resources.type'
import { ConnectionScope } from '../../core/type/scope.type'
import { AddressRepository } from './address.repository'

type ProviderAccountAndRelations = ProviderAccount & {
  addresses: ProviderAddress[]
}

type FindAllFilters = {
  filters?: {
    walletId?: string
    externalIds?: string[]
  }
}

export type FindAllOptions = FindAllFilters & { pagination?: PaginationOptions }

export type UpdateAccount = {
  clientId: string
  accountId: string
  label?: string
  addresses?: Address[]
  updatedAt?: Date
}

@Injectable()
export class AccountRepository {
  constructor(private prismaService: PrismaService) {}

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
      connectionId: account.connectionId,
      id: account.accountId,
      label: account.label || null,
      networkId: account.networkId,
      provider: account.provider,
      updatedAt: account.updatedAt,
      walletId: account.walletId
    }
  }

  async findByClientId(clientId: string, opts?: PaginationOptions): Promise<PaginatedResult<Account>> {
    const pagination = applyPagination(opts)

    const items = await this.prismaService.providerAccount.findMany({
      where: { clientId },
      include: {
        addresses: true
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items, pagination })
    return {
      data: data.map(AccountRepository.parseModel),
      page
    }
  }

  async findById({ clientId, connectionId }: ConnectionScope, accountId: string): Promise<Account> {
    const account = await this.prismaService.providerAccount.findUnique({
      where: {
        clientId,
        connectionId,
        id: accountId
      },
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
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Address>> {
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
    const { data, page } = getPaginatedResult({ items: account.addresses, pagination })
    return {
      data: data.map(AddressRepository.parseModel),
      page
    }
  }

  async bulkCreate(accounts: Account[]): Promise<Account[]> {
    await this.prismaService.providerAccount.createMany({
      data: accounts.map(AccountRepository.parseEntity)
    })

    return accounts
  }

  async bulkUpdate(updateAccounts: UpdateAccount[]): Promise<boolean> {
    await Promise.all(updateAccounts.map((u) => this.update(u)))

    return true
  }

  async update(updateAccount: UpdateAccount): Promise<boolean> {
    await this.prismaService.providerAccount.update({
      where: {
        clientId: updateAccount.clientId,
        id: updateAccount.accountId
      },
      data: {
        label: updateAccount.label,
        updatedAt: updateAccount.updatedAt || new Date()
      }
    })

    return true
  }

  async findAll(
    { clientId, connectionId }: ConnectionScope,
    options?: FindAllOptions
  ): Promise<PaginatedResult<Account>> {
    const pagination = applyPagination(options?.pagination)

    const models = await this.prismaService.providerAccount.findMany({
      where: {
        clientId,
        connectionId,
        ...(options?.filters?.walletId
          ? {
              walletId: options.filters.walletId
            }
          : {}),
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
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: models, pagination })

    return {
      data: data.map(AccountRepository.parseModel),
      page
    }
  }
}
