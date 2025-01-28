import { PaginatedResult, PaginationOptions, applyPagination, getPaginatedResult } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { ProviderAccount, ProviderAddress, ProviderWallet } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Account, UpdateWallet, Wallet } from '../../core/type/indexed-resources.type'
import { ConnectionScope } from '../../core/type/scope.type'
import { AccountRepository } from './account.repository'

type ProviderWalletsAndRelations = ProviderWallet & {
  accounts: Array<
    ProviderAccount & {
      addresses: ProviderAddress[]
    }
  >
}

type FindAllFilters = {
  filters?: {
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
    const { accounts, id, ...walletData } = wallet

    const mappedAccounts = accounts.map((account) => {
      return AccountRepository.parseModel(account)
    })

    const parsedWallet = Wallet.parse({
      ...walletData,
      walletId: id,
      accounts: mappedAccounts
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
      connectionId: entity.connectionId,
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

  async findById({ clientId, connectionId }: ConnectionScope, id: string): Promise<Wallet> {
    const model = await this.prismaService.providerWallet.findUnique({
      where: {
        clientId,
        connectionId,
        id
      },
      include: {
        accounts: {
          include: {
            addresses: true
          }
        }
      }
    })

    if (!model) {
      throw new NotFoundException({
        message: 'Wallet not found',
        context: { walletId: id }
      })
    }

    return WalletRepository.parseModel(model)
  }

  async findAll(
    { clientId, connectionId }: ConnectionScope,
    options?: FindAllOptions
  ): Promise<PaginatedResult<Wallet>> {
    const pagination = applyPagination(options?.pagination)
    const result = await this.prismaService.providerWallet.findMany({
      where: {
        clientId,
        connectionId,
        ...(options?.filters?.walletIds
          ? {
              id: {
                in: options?.filters.walletIds
              }
            }
          : {})
      },
      include: {
        accounts: {
          include: {
            addresses: true
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

    await this.prismaService.$transaction(async (tx) => {
      await tx.providerWallet.createMany({
        data: providerWallets,
        skipDuplicates: true
      })
    })

    return wallets
  }

  async update(wallet: UpdateWallet) {
    const model = await this.prismaService.providerWallet.update({
      where: { id: wallet.walletId },
      data: {
        updatedAt: wallet.updatedAt,
        label: wallet.label
      },
      include: {
        accounts: {
          include: {
            addresses: true
          }
        }
      }
    })

    return WalletRepository.parseModel(model)
  }
}
