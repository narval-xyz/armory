import { Permission } from '@narval/armory-sdk'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { Permissions } from '../../../../shared/decorator/permissions.decorator'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { ImportService } from '../../../core/service/import.service'
import { SeedService } from '../../../core/service/seed.service'
import { DeriveWalletDto, DeriveWalletResponseDto } from '../dto/derive-wallet.dto'
import { GenerateKeyDto } from '../dto/generate-key-dto'
import { GenerateKeyResponseDto } from '../dto/generate-key-response-dto'
import { ImportSeedDto } from '../dto/import-seed-dto'

@Controller('/seeds')
@Permissions([Permission.WALLET_CREATE])
@UseGuards(AuthorizationGuard)
export class SeedController {
  constructor(
    private seedService: SeedService,
    private importService: ImportService
  ) {}

  @Post('/import')
  async importSeed(@ClientId() clientId: string, @Body() body: ImportSeedDto) {
    const { wallet, keyId, backup } = await this.importService.importSeed(clientId, body)

    const response = GenerateKeyResponseDto.create({
      wallet,
      keyId,
      backup
    })

    return response
  }

  @Post('/generate')
  async generateKey(@ClientId() clientId: string, @Body() body: GenerateKeyDto) {
    const { wallet, keyId, backup } = await this.seedService.generate(clientId, body)
    const response = GenerateKeyResponseDto.create({
      wallet,
      keyId: keyId,
      backup
    })

    return response
  }

  @Post('/derive')
  async deriveWallet(@ClientId() clientId: string, @Body() body: DeriveWalletDto) {
    const wallets = await this.seedService.derive(clientId, body)
    const response = DeriveWalletResponseDto.create(wallets)

    return response
  }
}
