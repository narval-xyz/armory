import { Request } from '@narval/policy-engine-shared'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { SigningService } from '../../../core/service/signing.service'
import { SignRequestDto } from '../dto/sign-request.dto'

@Controller('/sign')
@UseGuards(ClientSecretGuard)
export class SignController {
  constructor(private signingService: SigningService) {}

  @Post()
  async sign(@ClientId() clientId: string, @Body() body: SignRequestDto) {
    const request: Request = body.request
    const result = await this.signingService.sign(clientId, request)

    return { signature: result }
  }
}
