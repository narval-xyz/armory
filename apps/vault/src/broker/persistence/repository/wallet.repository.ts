import { PaginatedResult, PaginationOptions, getPaginatedResult, getPaginationQuery } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { ProviderAccount, ProviderAddress, ProviderConnection, ProviderWallet } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Account, Wallet } from '../../core/type/indexed-resources.type'
import { AccountRepository } from './account.repository'
import { ConnectionRepository } from './connection.repository'

type ProviderWalletsAndRelations = ProviderWallet & {
  connections: { connection: ProviderConnection }[]
  accounts: Array<
    ProviderAccount & {
      addresses: ProviderAddress[]
    }
  >
}

type WalletFilters = {
  connectionId: string
}

@Injectable()
export class WalletRepository {
  constructor(private prismaService: PrismaService) {}

  static getCursorOrderColumns(): Array<keyof ProviderWallet> {
    return ['createdAt']
  }

  static parseModel(wallet: ProviderWalletsAndRelations): Wallet {
    const { connections, accounts, id, ...walletData } = wallet

    const validConnections = connections.map((join) => {
      return ConnectionRepository.parseModel(join.connection)
    })

    const mappedAccounts = accounts.map((account) => {
      return AccountRepository.parseModel(account)
    })

    return {
      ...walletData,
      walletId: id,
      accounts: mappedAccounts,
      connections: validConnections
    }
  }

  async findByClientId(clientId: string, options?: PaginationOptions): Promise<PaginatedResult<Wallet>> {
    const pagination = getPaginationQuery({ options, cursorOrderColumns: WalletRepository.getCursorOrderColumns() })
    const result = await this.prismaService.providerWallet.findMany({
      where: { clientId },
      include: {
        accounts: {
          include: {
            addresses: true
          }
        },
        connections: {
          include: {
            connection: true
          }
        }
      },
      ...pagination
    })
    const { data, page } = getPaginatedResult({ items: result, options: pagination })

    return {
      data: data.map(WalletRepository.parseModel),
      page
    }
  }

  async findById(clientId: string, id: string): Promise<Wallet> {
    const wallet = await this.prismaService.providerWallet.findUnique({
      where: { clientId, id },
      include: {
        accounts: {
          include: {
            addresses: true
          }
        },
        connections: {
          include: {
            connection: true
          }
        }
      }
    })
    if (!wallet) {
      throw new NotFoundException({
        message: 'Wallet not found',
        context: { walletId: id }
      })
    }

    return WalletRepository.parseModel(wallet)
  }

  async findAll(
    clientId: string,
    filters: WalletFilters,
    options: PaginationOptions
  ): Promise<PaginatedResult<Wallet>> {
    const pagination = getPaginationQuery({ options, cursorOrderColumns: WalletRepository.getCursorOrderColumns() })
    const result = await this.prismaService.providerWallet.findMany({
      where: {
        clientId,
        connections: {
          some: {
            connectionId: filters.connectionId
          }
        }
      },
      include: {
        accounts: {
          include: {
            addresses: true
          }
        },
        connections: {
          include: {
            connection: true
          }
        }
      },
      ...pagination
    })
    const { data, page } = getPaginatedResult({ items: result, options: pagination })

    return {
      data: data.map(WalletRepository.parseModel),
      page
    }
  }

  async findAccountsByWalletId(
    clientId: string,
    walletId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<Account>> {
    const pagination = getPaginationQuery({ options, cursorOrderColumns: AccountRepository.getCursorOrderColumns() })

    const wallet = await this.prismaService.providerWallet.findUnique({
      where: { clientId, id: walletId },
      include: {
        accounts: {
          include: {
            addresses: true
          },
          ...pagination
        },
        connections: true
      }
    })
    if (!wallet) {
      throw new NotFoundException({
        message: 'Wallet not found',
        context: { walletId }
      })
    }
    const { data, page } = getPaginatedResult({ items: wallet.accounts, options: pagination })

    return {
      data: data.map(AccountRepository.parseModel),
      page
    }
  }
}
