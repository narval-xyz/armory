import { Permission } from '@narval/armory-sdk'
import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { ImportService } from '../../../core/service/import.service'
import { KeyGenerationService } from '../../../core/service/key-generation.service'
import { GenerateKeyResponseDto } from '../dto/generate-key-response.dto'
import { GenerateKeyDto } from '../dto/generate-key.dto'
import { ImportSeedDto } from '../dto/import-seed.dto'

@Controller('/wallets')
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID,
  required: true
})
export class WalletController {
  constructor(
    private keyGenService: KeyGenerationService,
    private importService: ImportService
  ) {}

  @Post()
  @PermissionGuard(Permission.WALLET_CREATE)
  @ApiOperation({
    summary: 'Generates a new wallet'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: GenerateKeyResponseDto
  })
  async generateKey(@ClientId() clientId: string, @Body() body: GenerateKeyDto) {
    const { account, keyId, backup } = await this.keyGenService.generateWallet(clientId, body)
    const response = GenerateKeyResponseDto.create({
      account,
      keyId: keyId,
      backup
    })

    return response
  }

  @Post('/import')
  @PermissionGuard(Permission.WALLET_IMPORT)
  @ApiOperation({
    summary: 'Imports a wallet'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: GenerateKeyResponseDto
  })
  async importKey(@ClientId() clientId: string, @Body() body: ImportSeedDto) {
    const { account, keyId, backup } = await this.importService.importSeed(clientId, body)
    const response = GenerateKeyResponseDto.create({
      account,
      keyId: keyId,
      backup
    })

    return response
  }
}
