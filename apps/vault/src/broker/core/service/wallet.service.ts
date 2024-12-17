import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { FindAllOptions, WalletRepository } from '../../persistence/repository/wallet.repository'
import { Wallet } from '../type/indexed-resources.type'

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async getWallets(clientId: string, options: PaginationOptions): Promise<PaginatedResult<Wallet>> {
    return this.walletRepository.findByClientId(clientId, options)
  }

  async getWallet(clientId: string, walletId: string): Promise<Wallet> {
    return this.walletRepository.findById(clientId, walletId)
  }

  async bulkCreate(wallets: Wallet[]): Promise<Wallet[]> {
    return this.walletRepository.bulkCreate(wallets)
  }

  async findAll(clientId: string, options?: FindAllOptions): Promise<PaginatedResult<Wallet>> {
    return this.walletRepository.findAll(clientId, options)
  }
}
