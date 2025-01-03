import { PaginatedResult, PaginationOptions, applyPagination, getPaginatedResult } from '@narval/nestjs-shared'
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
import { Account, UpdateWallet, Wallet } from '../../core/type/indexed-resources.type'
import { AccountRepository } from './account.repository'
import { ConnectionRepository, SELECT_WITHOUT_CREDENTIALS } from './connection.repository'

type ProviderWalletsAndRelations = ProviderWallet & {
  connections: { connection: Partial<ProviderConnection> }[]
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

export type FindAllOptions = FindAllFilters & { pagination?: PaginationOptions }

export type FindAllPaginatedOptions = PaginationOptions & FindAllFilters

@Injectable()
export class WalletRepository {
  constructor(private prismaService: PrismaService) {}

  static parseModel(wallet: ProviderWalletsAndRelations): Wallet {
    const { connections, accounts, id, ...walletData } = wallet

    const validConnections = connections.map((join) => {
      return ConnectionRepository.parseModel(join.connection)
    })

    const mappedAccounts = accounts.map((account) => {
      return AccountRepository.parseModel(account)
    })

    const parsedWallet = Wallet.parse({
      ...walletData,
      walletId: id,
      accounts: mappedAccounts,
      connections: validConnections
    })

    return parsedWallet
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
    const pagination = applyPagination(options)

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
            connection: {
              select: SELECT_WITHOUT_CREDENTIALS
            }
          }
        }
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: result, pagination })

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
            connection: {
              select: SELECT_WITHOUT_CREDENTIALS
            }
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

  async findAll(clientId: string, options?: FindAllOptions): Promise<PaginatedResult<Wallet>> {
    const pagination = applyPagination(options?.pagination)
    const result = await this.prismaService.providerWallet.findMany({
      where: {
        clientId,
        ...(options?.filters?.walletIds
          ? {
              id: {
                in: options?.filters.walletIds
              }
            }
          : {}),
        ...(options?.filters?.connectionId
          ? {
              connections: {
                some: {
                  connectionId: options?.filters.connectionId
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
            connection: {
              select: SELECT_WITHOUT_CREDENTIALS
            }
          }
        }
      },
      ...pagination
    })
    const { data, page } = getPaginatedResult({ items: result, pagination })

    return {
      data: data.map(WalletRepository.parseModel),
      page
    }
  }

  async findAccountsByWalletId(
    clientId: string,
    walletId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Account>> {
    const wallet = await this.prismaService.providerWallet.findUnique({
      where: { clientId, id: walletId },
      include: {
        accounts: {
          include: {
            addresses: true
          },
          ...pagination
        },
        connections: {
          include: {
            connection: {
              select: SELECT_WITHOUT_CREDENTIALS
            }
          }
        }
      }
    })
    if (!wallet) {
      throw new NotFoundException({
        message: 'Wallet not found',
        context: { walletId }
      })
    }
    const { data, page } = getPaginatedResult({ items: wallet.accounts, pagination })

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

  async update(wallet: UpdateWallet) {
    const providerWalletConnections = wallet.connections.map((connection) => {
      return {
        clientId: wallet.clientId,
        walletId: wallet.walletId,
        connectionId: connection.connectionId,
        createdAt: wallet.updatedAt
      }
    })

    await this.prismaService.providerWalletConnection.createMany({
      data: providerWalletConnections,
      skipDuplicates: true
    })

    const updatedWallet = await this.prismaService.providerWallet.update({
      where: { id: wallet.walletId },
      data: {
        updatedAt: wallet.updatedAt,
        label: wallet.label
      },
      include: {
        connections: {
          include: {
            connection: {
              select: SELECT_WITHOUT_CREDENTIALS
            }
          }
        },
        accounts: {
          include: {
            addresses: true
          }
        }
      }
    })

    return WalletRepository.parseModel(updatedWallet)
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
