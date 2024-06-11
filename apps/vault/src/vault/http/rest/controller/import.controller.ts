import { Permission } from '@narval/armory-sdk'
import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { Permissions } from '../../../../shared/decorator/permissions.decorator'
import { ApplicationException } from '../../../../shared/exception/application.exception'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { ImportService } from '../../../core/service/import.service'
import { GenerateEncryptionKeyResponseDto } from '../dto/generate-encryption-key-response.dto'
import { GenerateKeyResponseDto } from '../dto/generate-key-response.dto'
import { ImportPrivateKeyResponseDto } from '../dto/import-private-key-response.dto'
import { ImportPrivateKeyDto } from '../dto/import-private-key.dto'
import { ImportSeedDto } from '../dto/import-seed.dto'

const PERMISSIONS = [Permission.WALLET_IMPORT]

@Controller('/import')
@Permissions(PERMISSIONS)
@UseGuards(AuthorizationGuard)
@ApiSecurity('GNAP', PERMISSIONS)
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post('/encryption-keys')
  @ApiOperation({
    summary: 'Generates an encryption key pair used to secure end-to-end communication containing sensitive information'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CLIENT_ID
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
  @ApiHeader({
    name: REQUEST_HEADER_CLIENT_ID
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
        body.walletId
      )
    } else if (body.privateKey) {
      importedKey = await this.importService.importPrivateKey(clientId, body.privateKey, body.walletId)
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
  @ApiHeader({
    name: REQUEST_HEADER_CLIENT_ID
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: GenerateKeyResponseDto
  })
  async importSeed(@ClientId() clientId: string, @Body() body: ImportSeedDto): Promise<GenerateKeyResponseDto> {
    const { wallet, keyId, backup } = await this.importService.importSeed(clientId, body)

    const response = GenerateKeyResponseDto.create({
      wallet,
      keyId,
      backup
    })

    return response
  }
}
