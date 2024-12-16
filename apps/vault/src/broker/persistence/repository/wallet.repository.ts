import { PaginatedResult, PaginationOptions, getPaginatedResult, getPaginationQuery } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import {
  ProviderAccount,
  ProviderAddress,
  ProviderConnection,
  ProviderWallet,
  ProviderWalletConnection
} from '@prisma/client/vault'
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

type FindAllFilters = {
  filters?: {
    connectionId?: string
    walletIds?: string[]
    externalIds?: string[]
  }
}

export type FindAllOptions = FindAllFilters

export type FindAllPaginatedOptions = PaginationOptions & FindAllFilters

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

    return Wallet.parse({
      ...walletData,
      walletId: id,
      accounts: mappedAccounts,
      connections: validConnections
    })
  }

  static parseEntity(entity: Wallet): ProviderWallet {
    return {
      id: entity.walletId,
      clientId: entity.clientId,
      externalId: entity.externalId,
      label: entity.label || null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      provider: entity.provider
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

  async findAllPaginated(clientId: string, options?: FindAllPaginatedOptions): Promise<PaginatedResult<Wallet>> {
    const pagination = getPaginationQuery({ options, cursorOrderColumns: WalletRepository.getCursorOrderColumns() })
    const result = await this.prismaService.providerWallet.findMany({
      where: {
        clientId,
        ...(options?.filters?.walletIds
          ? {
              id: {
                in: options.filters.walletIds
              }
            }
          : {}),
        ...(options?.filters?.connectionId
          ? {
              connections: {
                some: {
                  connectionId: options.filters.connectionId
                }
              }
            }
          : {})
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

  async findAll(clientId: string, options?: FindAllOptions): Promise<Wallet[]> {
    const models = await this.prismaService.providerWallet.findMany({
      where: {
        clientId,
        ...(options?.filters?.connectionId
          ? {
              connections: {
                some: {
                  connectionId: options.filters.connectionId
                }
              }
            }
          : {}),
        ...(options?.filters?.walletIds
          ? {
              id: {
                in: options.filters.walletIds
              }
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

    return models.map(WalletRepository.parseModel)
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

  async bulkCreate(wallets: Wallet[]): Promise<Wallet[]> {
    const providerWallets: ProviderWallet[] = wallets.map(WalletRepository.parseEntity)
    const providerWalletConnections: ProviderWalletConnection[] = wallets.flatMap(this.getWalletConnectionModel)

    await this.prismaService.$transaction(async (tx) => {
      await tx.providerWallet.createMany({
        data: providerWallets,
        skipDuplicates: true
      })

      await tx.providerWalletConnection.createMany({
        data: providerWalletConnections,
        skipDuplicates: true
      })
    })

    return wallets
  }

  private getWalletConnectionModel(wallet: Wallet): ProviderWalletConnection[] {
    return wallet.connections.map((connection) => {
      return {
        clientId: wallet.clientId,
        walletId: wallet.walletId,
        connectionId: connection.connectionId,
        createdAt: wallet.createdAt
      }
    })
  }
}
