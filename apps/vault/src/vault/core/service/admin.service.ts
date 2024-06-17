import { Injectable } from '@nestjs/common'
import { AccountRepository } from '../../persistence/repository/account.repository'

@Injectable()
export class AdminService {
  constructor(private accountRepository: AccountRepository) {}

  async getAccounts(clientId: string) {
    const accounts = await this.accountRepository.findByClientId(clientId)
    return accounts
  }
}
