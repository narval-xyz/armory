import { Permission } from '@narval/armory-sdk'
import { Body, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { Permissions } from '../../../../shared/decorator/permissions.decorator'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { KeyGenerationService } from '../../../core/service/generate.service'
import { GenerateKeyDto } from '../dto/generate-key-dto'
import { GenerateKeyResponseDto } from '../dto/generate-key-response-dto'

@Permissions([Permission.WALLET_CREATE])
@UseGuards(AuthorizationGuard)
export class GenerateController {
  constructor(private keyGenService: KeyGenerationService) {}

  @Post('/generate-key')
  async generateKey(@ClientId() clientId: string, @Body() body: GenerateKeyDto) {
    const { wallet, rootKeyId, backup } = await this.keyGenService.generateMnemonic(clientId, body)
    const response = new GenerateKeyResponseDto({ wallet, rootKeyId, backup })

    return response
  }
}
