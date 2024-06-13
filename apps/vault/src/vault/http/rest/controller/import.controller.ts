import { Permission } from '@narval/armory-sdk'
import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { ApplicationException } from '../../../../shared/exception/application.exception'
import { ImportService } from '../../../core/service/import.service'
import { GenerateEncryptionKeyResponseDto } from '../dto/generate-encryption-key-response.dto'
import { GenerateKeyResponseDto } from '../dto/generate-key-response.dto'
import { ImportPrivateKeyResponseDto } from '../dto/import-private-key-response.dto'
import { ImportPrivateKeyDto } from '../dto/import-private-key.dto'
import { ImportSeedDto } from '../dto/import-seed.dto'

@Controller('/import')
@PermissionGuard(Permission.WALLET_IMPORT)
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID,
  required: true
})
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post('/encryption-keys')
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

  @Post('/private-keys')
  @ApiOperation({
    summary: 'Imports a private key'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ImportPrivateKeyResponseDto
  })
  async importPrivateKey(
    @ClientId() clientId: string,
    @Body() body: ImportPrivateKeyDto
  ): Promise<ImportPrivateKeyResponseDto> {
    let importedKey
    if (body.encryptedPrivateKey) {
      importedKey = await this.importService.importEncryptedPrivateKey(
        clientId,
        body.encryptedPrivateKey,
        body.accountId
      )
    } else if (body.privateKey) {
      importedKey = await this.importService.importPrivateKey(clientId, body.privateKey, body.accountId)
    } else {
      throw new ApplicationException({
        message: 'Missing privateKey or encryptedPrivateKey',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }

    const response = new ImportPrivateKeyResponseDto(importedKey)

    return response
  }

  @Post('/seeds')
  @ApiOperation({
    summary: 'Imports a seed'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: GenerateKeyResponseDto
  })
  async importSeed(@ClientId() clientId: string, @Body() body: ImportSeedDto): Promise<GenerateKeyResponseDto> {
    const { account, keyId, backup } = await this.importService.importSeed(clientId, body)

    const response = GenerateKeyResponseDto.create({
      account,
      keyId,
      backup
    })

    return response
  }
}
