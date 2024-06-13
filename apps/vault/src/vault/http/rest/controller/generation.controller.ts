import { Permission } from '@narval/armory-sdk'
import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { KeyGenerationService } from '../../../core/service/key-generation.service'
import { DeriveWalletDto, DeriveWalletResponseDto } from '../dto/derive-_OLD_WALLET_.dto'
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
    const { _OLD_WALLET_, keyId, backup } = await this.keyGenService.generateMnemonic(clientId, body)
    const response = GenerateKeyResponseDto.create({
      _OLD_WALLET_,
      keyId: keyId,
      backup
    })

    return response
  }

  @Post('/derive/_OLD_WALLETS_')
  @ApiOperation({
    summary: 'Derives a new _OLD_WALLET_'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DeriveWalletResponseDto
  })
  async deriveWallet(@ClientId() clientId: string, @Body() body: DeriveWalletDto): Promise<DeriveWalletResponseDto> {
    const _OLD_WALLETS_ = await this.keyGenService.derive(clientId, body)
    const response = DeriveWalletResponseDto.create(_OLD_WALLETS_)

    return response
  }
}
