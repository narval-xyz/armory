import { ApiClientIdHeader, Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AccountService } from '../../../core/service/account.service'
import { WalletService } from '../../../core/service/wallet.service'
import { PaginatedAccountsDto } from '../dto/response/paginated-accounts.dto'
import { PaginatedWalletsDto } from '../dto/response/paginated-wallets.dto'
import { ProviderWalletDto } from '../dto/response/provider-wallet.dto'

@Controller({
  path: 'wallets',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Wallet')
export class ProviderWalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly accountService: AccountService
  ) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List the client wallets'
  })
  @Paginated({
    type: PaginatedWalletsDto,
    description: 'Returns a paginated list of wallets for the client'
  })
  async list(
    @ClientId() clientId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedWalletsDto> {
    return PaginatedWalletsDto.create(await this.walletService.getWallets(clientId, options))
  }

  @Get(':walletId')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Get a specific wallet by ID'
  })
  @ApiParam({
    name: 'walletId',
    description: 'The ID of the wallet to retrieve'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ProviderWalletDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wallet not found'
  })
  async getById(@ClientId() clientId: string, @Param('walletId') walletId: string): Promise<ProviderWalletDto> {
    const data = await this.walletService.getWallet(clientId, walletId)

    return ProviderWalletDto.create({ data })
  }

  @Get(':walletId/accounts')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'List accounts for a specific wallet'
  })
  @ApiParam({
    name: 'walletId',
    description: 'The ID of the wallet to retrieve accounts for'
  })
  @Paginated({
    type: PaginatedAccountsDto,
    description: 'Returns a paginated list of accounts'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wallet not found'
  })
  async listAccounts(
    @ClientId() clientId: string,
    @Param('walletId') walletId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedAccountsDto> {
    return PaginatedAccountsDto.create(
      await this.accountService.findAllPaginated(clientId, {
        ...options,
        filters: { walletId }
      })
    )
  }
}
