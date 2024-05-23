import { Permission } from '@narval/armory-sdk'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { Permissions } from '../../../../shared/decorator/permissions.decorator'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { KeyGenerationService } from '../../../core/service/key-generation.service'
import { DeriveWalletDto, DeriveWalletResponseDto } from '../dto/derive-wallet-dto'
import { GenerateKeyDto } from '../dto/generate-key-dto'
import { GenerateKeyResponseDto } from '../dto/generate-key-response-dto'

@Controller()
@Permissions([Permission.WALLET_CREATE])
@UseGuards(AuthorizationGuard)
export class GenerationController {
  constructor(private keyGenService: KeyGenerationService) {}

  @Post('/generate-key')
  async generateKey(@ClientId() clientId: string, @Body() body: GenerateKeyDto) {
    const { wallet, rootKeyId, backup } = await this.keyGenService.generateMnemonic(clientId, body)
    const response = new GenerateKeyResponseDto({ wallet, rootKeyId, backup })

    return response
  }

  @Post('/derive-wallet')
  async deriveWallet(@ClientId() clientId: string, @Body() body: DeriveWalletDto) {
    const wallets = await this.keyGenService.deriveWallet(clientId, body)
    const response = new DeriveWalletResponseDto(wallets)

    return response
  }
}
