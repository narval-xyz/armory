import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { AccountRepository, FindAllOptions } from '../../persistence/repository/account.repository'
import { Account, Address } from '../type/indexed-resources.type'

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async getAccounts(clientId: string, options: PaginationOptions): Promise<PaginatedResult<Account>> {
    return this.accountRepository.findByClientId(clientId, options)
  }

  async getAccount(clientId: string, AccountId: string): Promise<Account> {
    return this.accountRepository.findById(clientId, AccountId)
  }

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

  async findAll(clientId: string, options?: FindAllOptions): Promise<PaginatedResult<Account>> {
    return this.accountRepository.findAll(clientId, options)
  }
}
