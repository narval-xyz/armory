import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { SignMessageRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/sign-message-request.dto'
import { SignTransactionRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/sign-transaction-request.dto'
import { SignatureDto } from '@app/orchestration/policy-engine/http/rest/dto/signature.dto'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, IsString, ValidateNested } from 'class-validator'

@ApiExtraModels(SignTransactionRequestDto, SignMessageRequestDto)
export class AuthorizationRequestDto {
  @IsEnum(SupportedAction)
  @IsDefined()
  @ApiProperty({
    enum: SupportedAction
  })
  action: `${SupportedAction}`

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

  @ValidateNested()
  @Type((opts) => {
    return opts?.object.action === SupportedAction.SIGN_TRANSACTION ? SignTransactionRequestDto : SignMessageRequestDto
  })
  @IsDefined()
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDto) }, { $ref: getSchemaPath(SignMessageRequestDto) }]
  })
  request: SignTransactionRequestDto | SignMessageRequestDto

  @IsString()
  @IsDefined()
  // @Validate(RequestHash)
  @ApiProperty({
    description: 'The hash of the request in EIP-191 format.',
    required: true
  })
  hash: string

  isSignTransaction(request: SignTransactionRequestDto | SignMessageRequestDto): request is SignTransactionRequestDto {
    return this.action === SupportedAction.SIGN_TRANSACTION
  }

  isSignMessage(request: SignTransactionRequestDto | SignMessageRequestDto): request is SignMessageRequestDto {
    return this.action === SupportedAction.SIGN_MESSAGE
  }
}
