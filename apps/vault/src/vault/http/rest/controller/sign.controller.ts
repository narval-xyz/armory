import { Request } from '@narval/policy-engine-shared'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { createZodDto } from 'nestjs-zod'
import {
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction
} from 'packages/policy-engine-shared/src/lib/type/action.type'
import { z } from 'zod'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { NonceGuard } from '../../../../shared/guard/nonce.guard'
import { SigningService } from '../../../core/service/signing.service'

const SignRequest = z.object({
  request: z.union([SignTransactionAction, SignMessageAction, SignTypedDataAction, SignRawAction])
})

class SignRequestDto extends createZodDto(SignRequest) {}

@Controller('/sign')
@UseGuards(AuthorizationGuard, NonceGuard)
export class SignController {
  constructor(private signingService: SigningService) {}

  @Post()
  async sign(@ClientId() clientId: string, @Body() body: SignRequestDto) {
    const request: Request = body.request
    const result = await this.signingService.sign(clientId, request)

    return { signature: result }
  }
}
