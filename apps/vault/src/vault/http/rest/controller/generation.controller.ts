import { Permission } from '@narval/armory-sdk'
import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { KeyGenerationService } from '../../../core/service/key-generation.service'
import { DeriveWalletDto, DeriveWalletResponseDto } from '../dto/derive-wallet.dto'
import { GenerateKeyResponseDto } from '../dto/generate-key-response.dto'
import { GenerateKeyDto } from '../dto/generate-key.dto'

@Controller()
@PermissionGuard(Permission.WALLET_CREATE)
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID,
  required: true
})
export class GenerationController {
  constructor(private keyGenService: KeyGenerationService) {}

  @Post('/generate/keys')
  @ApiOperation({
    summary: 'Generates a new private key from the given key ID'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: GenerateKeyResponseDto
  })
  async generateKey(@ClientId() clientId: string, @Body() body: GenerateKeyDto): Promise<GenerateKeyResponseDto> {
    const { wallet, keyId, backup } = await this.keyGenService.generateMnemonic(clientId, body)
    const response = GenerateKeyResponseDto.create({
      wallet,
      keyId: keyId,
      backup
    })

    return response
  }

  @Post('/derive/wallets')
  @ApiOperation({
    summary: 'Derives a new wallet'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DeriveWalletResponseDto
  })
  async deriveWallet(@ClientId() clientId: string, @Body() body: DeriveWalletDto): Promise<DeriveWalletResponseDto> {
    const wallets = await this.keyGenService.derive(clientId, body)
    const response = DeriveWalletResponseDto.create(wallets)

    return response
  }
}
