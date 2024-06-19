import { Permission } from '@narval/armory-sdk'
import { Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { ImportService } from '../../../core/service/import.service'
import { GenerateEncryptionKeyResponseDto } from '../dto/generate-encryption-key-response.dto'

@Controller('/encryption-keys')
@PermissionGuard(Permission.WALLET_IMPORT)
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID,
  required: true
})
export class EncryptionKeyController {
  constructor(private importService: ImportService) {}

  @Post()
  @ApiOperation({
    summary: 'Generates an encryption key pair used to secure end-to-end communication containing sensitive information'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: GenerateEncryptionKeyResponseDto
  })
  async generateEncryptionKey(@ClientId() clientId: string): Promise<GenerateEncryptionKeyResponseDto> {
    const publicKey = await this.importService.generateEncryptionKey(clientId)

    const response = new GenerateEncryptionKeyResponseDto(publicKey)

    return response
  }
}
