import { ApiClientIdHeader, Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AccountService } from '../../../core/service/account.service'
import { RawAccountService } from '../../../core/service/raw-account.service'
import { REQUEST_HEADER_CONNECTION_ID } from '../../../shared/constant'
import { ConnectionId } from '../../../shared/decorator/connection-id.decorator'
import { PaginatedAccountsDto } from '../dto/response/paginated-accounts.dto'
import { PaginatedAddressesDto } from '../dto/response/paginated-addresses.dto'
import { PaginatedRawAccountsDto } from '../dto/response/paginated-raw-accounts.dto'
import { ProviderAccountDto } from '../dto/response/provider-account.dto'

@Controller({
  path: 'accounts',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Account')
export class ProviderAccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly rawAccountService: RawAccountService
  ) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List the client accounts'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed'
  })
  @Paginated({
    type: PaginatedAccountsDto,
    description: 'Returns a paginated list of accounts for the client'
  })
  async list(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @PaginationParam() pagination: PaginationOptions
  ): Promise<PaginatedAccountsDto> {
    return PaginatedAccountsDto.create(
      await this.accountService.findAll(
        {
          clientId,
          connectionId
        },
        { pagination }
      )
    )
  }

  @Get('raw')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List the provider accounts in raw form, used to populate which accounts to connect'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed'
  })
  @ApiQuery({
    name: 'namePrefix',
    required: false,
    description: 'Filter accounts by name prefix'
  })
  @ApiQuery({
    name: 'nameSuffix',
    required: false,
    description: 'Filter accounts by name suffix'
  })
  @ApiQuery({
    name: 'networkId',
    required: false,
    description: 'Filter accounts by network ID'
  })
  @ApiQuery({
    name: 'assetId',
    required: false,
    description: 'Filter accounts by asset ID'
  })
  @ApiQuery({
    name: 'includeAddress',
    required: false,
    type: 'boolean',
    description: 'Include address information in the response'
  })
  @Paginated({
    type: PaginatedRawAccountsDto,
    description: 'Returns a paginated list of raw accounts, used to populate which accounts to connect.'
  })
  async listRaw(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @PaginationParam() pagination: PaginationOptions,
    @Query('namePrefix') namePrefix?: string,
    @Query('nameSuffix') nameSuffix?: string,
    @Query('networkId') networkId?: string,
    @Query('assetId') assetId?: string,
    @Query('includeAddress') includeAddress?: boolean
  ): Promise<PaginatedRawAccountsDto> {
    return PaginatedRawAccountsDto.create(
      await this.rawAccountService.findAllPaginated(clientId, connectionId, {
        pagination,
        filters: {
          namePrefix,
          nameSuffix,
          networkId,
          assetId,
          includeAddress
        }
      })
    )
  }

  @Get(':accountId')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Get a specific account by ID'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed'
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
  async getById(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('accountId') accountId: string
  ): Promise<ProviderAccountDto> {
    const data = await this.accountService.findById({ clientId, connectionId }, accountId)

    return ProviderAccountDto.create({ data })
  }

  @Get(':accountId/addresses')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List addresses for a specific account'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed'
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
