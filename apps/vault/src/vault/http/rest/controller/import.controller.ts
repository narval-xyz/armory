import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { ImportService } from '../../../core/service/import.service'
import { ImportPrivateKeyDto } from '../dto/import-private-key-dto'
import { ImportPrivateKeyResponseDto } from '../dto/import-private-key-response-dto'

@Controller('/import')
@UseGuards(ClientSecretGuard)
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post('/private-key')
  async create(@ClientId() clientId: string, @Body() body: ImportPrivateKeyDto) {
    const importedKey = await this.importService.importPrivateKey(clientId, body.privateKey, body.walletId)

    const response = new ImportPrivateKeyResponseDto(importedKey)

    return response
  }
}
