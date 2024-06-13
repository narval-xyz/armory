import { Permission } from '@narval/armory-sdk'
import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { KeyGenerationService } from '../../../core/service/key-generation.service'
import { DeriveAccountDto, DeriveAccountResponseDto } from '../dto/derive-account.dto'
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
    const { account, keyId, backup } = await this.keyGenService.generateWallet(clientId, body)
    const response = GenerateKeyResponseDto.create({
      account,
      keyId: keyId,
      backup
    })

    return response
  }

  @Post('/derive/accounts')
  @ApiOperation({
    summary: 'Derives a new account'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DeriveAccountResponseDto
  })
  async deriveAccount(@ClientId() clientId: string, @Body() body: DeriveAccountDto): Promise<DeriveAccountResponseDto> {
    const accounts = await this.keyGenService.derive(clientId, body)
    const response = DeriveAccountResponseDto.create(accounts)

    return response
  }
}
