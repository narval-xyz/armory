import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import {
  FindAllOptions,
  FindAllPaginatedOptions,
  WalletRepository
} from '../../persistence/repository/wallet.repository'
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

  async findAllPaginated(clientId: string, options?: FindAllPaginatedOptions): Promise<PaginatedResult<Wallet>> {
    return this.walletRepository.findAllPaginated(clientId, options)
  }

  async findAll(clientId: string, options?: FindAllOptions): Promise<Wallet[]> {
    return this.walletRepository.findAll(clientId, options)
  }
}
