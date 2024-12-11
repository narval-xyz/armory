import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { Account, Wallet } from '../type/indexed-resources.type'

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async getWallets(clientId: string, options: PaginationOptions): Promise<PaginatedResult<Wallet>> {
    return this.walletRepository.findByClientId(clientId, options)
  }

  async getWallet(clientId: string, walletId: string): Promise<Wallet> {
    return this.walletRepository.findById(clientId, walletId)
  }

  async getWalletAccounts(
    clientId: string,
    walletId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<Account>> {
    return this.accountRepository.findAll(clientId, { walletId }, options)
  }
}
