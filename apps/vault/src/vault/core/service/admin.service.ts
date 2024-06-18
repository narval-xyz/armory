import { Injectable } from '@nestjs/common'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { RootKeyRepository } from '../../persistence/repository/root-key.repository'

@Injectable()
export class AdminService {
  constructor(
    private accountRepository: AccountRepository,
    private rootKeyRepository: RootKeyRepository
  ) {}

  async getAccounts(clientId: string) {
    const accounts = await this.accountRepository.findByClientId(clientId)
    return accounts
  }

  async getWallets(clientId: string) {
    const seeds = await this.rootKeyRepository.findByClientId(clientId)
    return seeds
  }
}
