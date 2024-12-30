import { ApiClientIdHeader, Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AccountService } from '../../../core/service/account.service'
import { PaginatedAccountsDto } from '../dto/response/paginated-accounts.dto'
import { PaginatedAddressesDto } from '../dto/response/paginated-addresses.dto'
import { ProviderAccountDto } from '../dto/response/provider-account.dto'

@Controller({
  path: 'accounts',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Account')
export class ProviderAccountController {
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
  async list(
    @ClientId() clientId: string,
    @PaginationParam() pagination: PaginationOptions
  ): Promise<PaginatedAccountsDto> {
    return PaginatedAccountsDto.create(await this.accountService.findAll(clientId, { pagination }))
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
  async getById(@ClientId() clientId: string, @Param('accountId') accountId: string): Promise<ProviderAccountDto> {
    const data = await this.accountService.findById(clientId, accountId)

    return ProviderAccountDto.create({ data })
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
  async listAddresses(
    @ClientId() clientId: string,
    @Param('accountId') accountId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedAddressesDto> {
    return PaginatedAddressesDto.create(await this.accountService.getAccountAddresses(clientId, accountId, options))
  }
}
