import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { Account, Address } from '../type/indexed-resources.type'

@Injectable()
export class AccountService {
  constructor(private readonly AccountRepository: AccountRepository) {}

  async getAccounts(clientId: string, options: PaginationOptions): Promise<PaginatedResult<Account>> {
    return this.AccountRepository.findByClientId(clientId, options)
  }

  async getAccount(clientId: string, AccountId: string): Promise<Account> {
    return this.AccountRepository.findById(clientId, AccountId)
  }

  async getAccountAddresses(
    clientId: string,
    AccountId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<Address>> {
    return this.AccountRepository.findAddressesByAccountId(clientId, AccountId, options)
  }
}
