import { Permission } from '@narval/armory-sdk'
import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { ImportService } from '../../../core/service/import.service'
import { EncryptionKeyDto } from '../dto/encryption-key.dto'

@Controller({
  path: '/encryption-keys',
  version: '1'
})
@PermissionGuard(Permission.WALLET_IMPORT)
@ApiTags('Encryption Key')
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
    type: EncryptionKeyDto
  })
  async generate(@ClientId() clientId: string): Promise<EncryptionKeyDto> {
    const publicKey = await this.importService.generateEncryptionKey(clientId)

    return EncryptionKeyDto.create({ publicKey })
  }
}
