import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { AccountRepository, FindAllOptions, UpdateAccount } from '../../persistence/repository/account.repository'
import { Account, Address } from '../type/indexed-resources.type'

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async getAccountAddresses(
    clientId: string,
    AccountId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<Address>> {
    return this.accountRepository.findAddressesByAccountId(clientId, AccountId, options)
  }

  async findAllPaginated(clientId: string, options?: FindAllOptions): Promise<PaginatedResult<Account>> {
    return this.accountRepository.findAll(clientId, options)
  }

  async bulkCreate(accounts: Account[]): Promise<Account[]> {
    return this.accountRepository.bulkCreate(accounts)
  }

  async bulkUpdate(updateAccounts: UpdateAccount[]): Promise<boolean> {
    return this.accountRepository.bulkUpdate(updateAccounts)
  }

  async update(updateAccount: UpdateAccount): Promise<boolean> {
    return this.accountRepository.update(updateAccount)
  }

  async findAll(clientId: string, options?: FindAllOptions): Promise<PaginatedResult<Account>> {
    return this.accountRepository.findAll(clientId, options)
  }

  async findById(clientId: string, accountId: string): Promise<Account> {
    return this.accountRepository.findById(clientId, accountId)
  }
}
