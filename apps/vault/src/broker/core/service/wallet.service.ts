import { PaginatedResult } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { FindAllOptions, WalletRepository } from '../../persistence/repository/wallet.repository'
import { UpdateWallet, Wallet } from '../type/indexed-resources.type'

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async bulkCreate(wallets: Wallet[]): Promise<Wallet[]> {
    return this.walletRepository.bulkCreate(wallets)
  }

  async bulkUpdate(wallets: Wallet[]): Promise<Wallet[]> {
    return Promise.all(wallets.map((wallet) => this.update(wallet)))
  }

  async update(wallet: UpdateWallet): Promise<Wallet> {
    return this.walletRepository.update(wallet)
  }

  async findAll(clientId: string, options?: FindAllOptions): Promise<PaginatedResult<Wallet>> {
    return this.walletRepository.findAll(clientId, options)
  }

  async findById(clientId: string, accountId: string): Promise<Wallet> {
    return this.walletRepository.findById(clientId, accountId)
  }
}
