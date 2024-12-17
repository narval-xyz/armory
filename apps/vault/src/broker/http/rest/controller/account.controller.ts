import { Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AccountService } from '../../../core/service/account.service'
import { ProviderAccountDto } from '../dto/response/account.dto'
import { PaginatedAccountsDto } from '../dto/response/paginated-accounts.dto'
import { PaginatedAddressesDto } from '../dto/response/paginated-addresses.dto'

@Controller({
  path: 'accounts',
  version: '1'
})
@ApiTags('Provider Account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List the client accounts'
  })
  @Paginated({
    type: PaginatedAccountsDto,
    description: 'Returns a paginated list of accounts for the client'
  })
  async listByClientId(
    @ClientId() clientId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedAccountsDto> {
    const { data, page } = await this.accountService.getAccounts(clientId, options)
    const ret = PaginatedAccountsDto.create({
      accounts: data,
      page
    })
    return ret
  }

  @Get(':accountId')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Get a specific account by ID'
  })
  @ApiParam({
    name: 'accountId',
    description: 'The ID of the account to retrieve'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ProviderAccountDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found'
  })
  async getAccountById(
    @ClientId() clientId: string,
    @Param('accountId') accountId: string
  ): Promise<ProviderAccountDto> {
    const account = await this.accountService.getAccount(clientId, accountId)
    return ProviderAccountDto.create({ account })
  }

  @Get(':accountId/addresses')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List addresses for a specific account'
  })
  @ApiParam({
    name: 'accountId',
    description: 'The ID of the account to retrieve addresses for'
  })
  @Paginated({
    type: PaginatedAddressesDto,
    description: 'Returns a paginated list of addresses for the client'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Address not found'
  })
  async getAccountAddresses(
    @ClientId() clientId: string,
    @Param('accountId') accountId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedAddressesDto> {
    const { data, page } = await this.accountService.getAccountAddresses(clientId, accountId, options)

    return PaginatedAddressesDto.create({
      addresses: data,
      page
    })
  }
}
