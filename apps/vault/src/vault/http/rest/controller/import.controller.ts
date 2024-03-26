import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ApplicationException } from '../../../../shared/exception/application.exception'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { ImportService } from '../../../core/service/import.service'
import { GenerateEncryptionKeyResponseDto } from '../dto/generate-encryption-key-response.dto'
import { ImportPrivateKeyDto } from '../dto/import-private-key-dto'
import { ImportPrivateKeyResponseDto } from '../dto/import-private-key-response-dto'

@Controller('/import')
@UseGuards(ClientSecretGuard)
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post('/encryption-key')
  async generateEncryptionKey(@ClientId() clientId: string) {
    const publicKey = await this.importService.generateEncryptionKey(clientId)

    const response = new GenerateEncryptionKeyResponseDto(publicKey)

    return response
  }

  @Post('/private-key')
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
}
