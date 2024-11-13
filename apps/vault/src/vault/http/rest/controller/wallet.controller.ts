import { Permission } from '@narval/armory-sdk'
import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { AdminService } from '../../../core/service/admin.service'
import { ImportService } from '../../../core/service/import.service'
import { KeyGenerationService } from '../../../core/service/key-generation.service'
import { GenerateWalletDto } from '../dto/generate-wallet.dto'
import { ImportWalletDto } from '../dto/import-wallet.dto'
import { WalletDto } from '../dto/wallet.dto'
import { WalletsDto } from '../dto/wallets.dto'

@Controller({
  path: '/wallets',
  version: '1'
})
@ApiTags('Wallet')
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID,
  required: true
})
export class WalletController {
  constructor(
    private keyGenService: KeyGenerationService,
    private importService: ImportService,
    private adminService: AdminService
  ) {}

  @Get()
  @PermissionGuard(Permission.WALLET_READ)
  @ApiOperation({
    summary: 'List the client wallets'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: WalletsDto
  })
  async list(@ClientId() clientId: string): Promise<WalletsDto> {
    const wallets = await this.adminService.getWallets(clientId)

    return WalletsDto.create({ wallets })
  }

  @Post()
  @PermissionGuard(Permission.WALLET_CREATE)
  @ApiOperation({
    summary: 'Generates a new wallet'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: WalletDto
  })
  async generate(@ClientId() clientId: string, @Body() body: GenerateWalletDto): Promise<WalletDto> {
    const { account, keyId, backup } = await this.keyGenService.generateWallet(clientId, body)

    return WalletDto.create({
      account,
      keyId: keyId,
      backup
    })
  }

  @Post('/import')
  @PermissionGuard(Permission.WALLET_IMPORT)
  @ApiOperation({
    summary: 'Imports a wallet'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: WalletDto
  })
  async importSeed(@ClientId() clientId: string, @Body() body: ImportWalletDto): Promise<WalletDto> {
    const { account, keyId, backup } = await this.importService.importSeed(clientId, body)

    return WalletDto.create({
      account,
      keyId: keyId,
      backup
    })
  }
}
