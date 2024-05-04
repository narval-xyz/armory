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
import { SigningService } from '../../../core/service/signing.service'

const SignRequest = z.object({
  request: z.union([SignTransactionAction, SignMessageAction, SignTypedDataAction, SignRawAction])
})

class SignRequestDto extends createZodDto(SignRequest) {}
@Controller('/sign')
@UseGuards(AuthorizationGuard)
export class SignController {
  constructor(private signingService: SigningService) {}

  @Post()
  async sign(@ClientId() clientId: string, @Body() body: SignRequestDto) {
    const parsed = SignRequest.parse(body)
    const { request } = parsed
    const result = await this.signingService.sign(clientId, request)

    return { signature: result }
  }
}
