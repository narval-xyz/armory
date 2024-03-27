import { Request } from '@narval/policy-engine-shared'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { createZodDto } from 'nestjs-zod'
import {
  SignMessageActionSchema,
  SignTransactionActionSchema,
  SignTypedDataActionSchema
} from 'packages/policy-engine-shared/src/lib/schema/action.schema'
import { z } from 'zod'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { SigningService } from '../../../core/service/signing.service'

const SignRequestSchema = z.object({
  request: z.union([SignTransactionActionSchema, SignMessageActionSchema, SignTypedDataActionSchema])
})

class SignRequestDto extends createZodDto(SignRequestSchema) {}
@Controller('/sign')
@UseGuards(AuthorizationGuard)
export class SignController {
  constructor(private signingService: SigningService) {}

  @Post()
  async sign(@ClientId() clientId: string, @Body() body: SignRequestDto) {
    const request: Request = body.request
    const result = await this.signingService.sign(clientId, request)

    return { signature: result }
  }
}
