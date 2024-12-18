import { Permission } from '@narval/armory-sdk'
import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { publicKeyToPem } from '@narval/signature'
import { Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../../shared/type/domain.type'
import { EncryptionKeyService } from '../../../../core/service/encryption-key.service'
import { EncryptionKeyDto } from '../dto/response/encryption-key.dto'

@Controller({
  path: '/encryption-keys',
  version: '1'
})
@PermissionGuard(Permission.WALLET_IMPORT, VaultPermission.CONNECTION_WRITE)
@ApiTags('Encryption Key')
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID,
  required: true
})
export class EncryptionKeyController {
  constructor(private readonly encryptionKeyService: EncryptionKeyService) {}

  @Post()
  @ApiOperation({
    summary: 'Generates an encryption key pair used to secure end-to-end communication containing sensitive information'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: EncryptionKeyDto
  })
  async generate(@ClientId() clientId: string): Promise<EncryptionKeyDto> {
    const encryptionKey = await this.encryptionKeyService.generate(clientId)

    const encryptionPem = encryptionKey.publicKey
      ? await publicKeyToPem(encryptionKey.publicKey, encryptionKey.publicKey.alg)
      : undefined

    return EncryptionKeyDto.create({
      publicKey: encryptionKey.publicKey,
      data: {
        keyId: encryptionKey.publicKey?.kid,
        jwk: encryptionKey.publicKey,
        pem: encryptionPem ? Buffer.from(encryptionPem).toString('base64') : undefined
      }
    })
  }
}
