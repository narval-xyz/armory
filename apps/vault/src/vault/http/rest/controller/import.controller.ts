import { Permission } from '@narval/armory-sdk'
import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common'
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

@Controller('/import')
@Permissions([Permission.WALLET_IMPORT])
@UseGuards(AuthorizationGuard)
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post('/encryption-keys')
  async generateEncryptionKey(@ClientId() clientId: string) {
    const publicKey = await this.importService.generateEncryptionKey(clientId)

    const response = new GenerateEncryptionKeyResponseDto(publicKey)

    return response
  }

  @Post('/private-keys')
  async create(@ClientId() clientId: string, @Body() body: ImportPrivateKeyDto) {
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
  async importSeed(@ClientId() clientId: string, @Body() body: ImportSeedDto) {
    const { wallet, keyId, backup } = await this.importService.importSeed(clientId, body)

    const response = GenerateKeyResponseDto.create({
      wallet,
      keyId,
      backup
    })

    return response
  }
}
