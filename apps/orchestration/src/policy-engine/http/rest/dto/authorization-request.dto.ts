import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { SignMessageRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/sign-message-request.dto'
import { SignTransactionRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/sign-transaction-request.dto'
import { SignatureDto } from '@app/orchestration/policy-engine/http/rest/dto/signature.dto'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'

@ApiExtraModels(SignTransactionRequestDto, SignMessageRequestDto)
export class AuthorizationRequestDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  authentication: SignatureDto

  @IsDefined()
  @ValidateNested()
  @ApiProperty({
    type: () => SignatureDto,
    isArray: true
  })
  approvals: SignatureDto[]

  // TODO (@wcalderipe, 22/01/24): Test the discrimination type option from
  // class-transformer instead of a custom function map.
  //
  // See https://github.com/typestack/class-transformer?tab=readme-ov-file#working-with-nested-objects
  @ValidateNested()
  @Type((opts) => {
    return opts?.object.request.action === SupportedAction.SIGN_TRANSACTION
      ? SignTransactionRequestDto
      : SignMessageRequestDto
  })
  @IsDefined()
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDto) }, { $ref: getSchemaPath(SignMessageRequestDto) }]
  })
  request: SignTransactionRequestDto | SignMessageRequestDto

  isSignTransaction(request: SignTransactionRequestDto | SignMessageRequestDto): request is SignTransactionRequestDto {
    return this.request.action === SupportedAction.SIGN_TRANSACTION
  }

  isSignMessage(request: SignTransactionRequestDto | SignMessageRequestDto): request is SignMessageRequestDto {
    return this.request.action === SupportedAction.SIGN_MESSAGE
  }
}
