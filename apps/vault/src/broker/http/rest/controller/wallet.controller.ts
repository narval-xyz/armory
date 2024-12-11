import { Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { WalletService } from '../../../core/service/wallet.service'
import { PaginatedAccountsDto } from '../dto/response/accounts.dto'
import { WalletDto } from '../dto/response/wallet.dto'
import { PaginatedWalletsDto } from '../dto/response/wallets.dto'
@Controller({
  path: 'wallets',
  version: '1'
})
@ApiTags('Wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({
    summary: 'List the client wallets'
  })
  @Paginated({
    type: PaginatedWalletsDto,
    description: 'Returns a paginated list of wallets for the client'
  })
  async listByClientId(
    @ClientId() clientId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedWalletsDto> {
    const { data, page } = await this.walletService.getWallets(clientId, options)
    const ret = PaginatedWalletsDto.create({
      wallets: data,
      page
    })
    return ret
  }

  @Get(':walletId')
  @ApiOperation({
    summary: 'Get a specific wallet by ID'
  })
  @ApiParam({
    name: 'walletId',
    description: 'The ID of the wallet to retrieve'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: WalletDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wallet not found'
  })
  async getWalletById(@ClientId() clientId: string, @Param('walletId') walletId: string): Promise<WalletDto> {
    const wallet = await this.walletService.getWallet(clientId, walletId)
    return WalletDto.create({ wallet })
  }

  @Get(':walletId/accounts')
  @ApiOperation({
    summary: 'List accounts for a specific wallet'
  })
  @ApiParam({
    name: 'walletId',
    description: 'The ID of the wallet to retrieve accounts for'
  })
  @Paginated({
    type: PaginatedWalletsDto,
    description: 'Returns a paginated list of wallets for the client'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wallet not found'
  })
  async getWalletAccounts(
    @ClientId() clientId: string,
    @Param('walletId') walletId: string,
    @PaginationParam() options: PaginationOptions
  ): Promise<PaginatedAccountsDto> {
    const { data, page } = await this.walletService.getWalletAccounts(clientId, walletId, options)
    return PaginatedAccountsDto.create({
      accounts: data,
      page
    })
  }
}
