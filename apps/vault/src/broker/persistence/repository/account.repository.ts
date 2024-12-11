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

type AccountFilters = {
  connectionId?: string
  walletId?: string
}
@Injectable()
export class AccountRepository {
  constructor(private prismaService: PrismaService) {}

  static getCursorOrderColumns(): Array<keyof ProviderAccount> {
    return ['createdAt']
  }

  static parseModel(account: ProviderAccountAndRelations): Account {
    return {
      ...account,
      accountId: account.id,
      addresses: account.addresses.map(AddressRepository.map)
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
      data: data.map(AddressRepository.map),
      page
    }
  }

  async findAll(
    clientId: string,
    filters?: AccountFilters,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Account>> {
    const pagination = getPaginationQuery({ options, cursorOrderColumns: AccountRepository.getCursorOrderColumns() })
    const result = await this.prismaService.providerAccount.findMany({
      where: {
        clientId,
        walletId: filters?.walletId,
        wallet: {
          connections: {
            some: {
              connectionId: filters?.connectionId
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
}
