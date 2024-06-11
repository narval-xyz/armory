import { ApiGnapSecurity } from '@narval/nestjs-shared'
import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { NonceGuard } from '../../../../shared/guard/nonce.guard'
import { SigningService } from '../../../core/service/signing.service'
import { SignRequestDto } from '../dto/sign-request.dto'
import { SignatureDto } from '../dto/signature.dto'

@Controller('/sign')
@UseGuards(AuthorizationGuard, NonceGuard)
@ApiGnapSecurity()
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID
})
export class SignController {
  constructor(private signingService: SigningService) {}

  @Post()
  @ApiOperation({
    summary: 'Signs the given request'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SignatureDto
  })
  async sign(@ClientId() clientId: string, @Body() body: SignRequestDto): Promise<SignatureDto> {
    const result = await this.signingService.sign(clientId, body.request)

    return SignatureDto.create({ signature: result })
  }
}
