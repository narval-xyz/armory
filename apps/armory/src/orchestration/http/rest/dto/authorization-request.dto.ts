import { Action } from '@narval/policy-engine-shared'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsOptional, IsString, ValidateNested } from 'class-validator'
import { SignMessageRequestDto } from '../../../http/rest/dto/sign-message-request.dto'
import { SignTransactionRequestDto } from '../../../http/rest/dto/sign-transaction-request.dto'

@ApiExtraModels(SignTransactionRequestDto, SignMessageRequestDto)
export class AuthorizationRequestDto {
  @IsDefined()
  @IsString()
  @ApiProperty()
  authentication: string

  @IsOptional()
  @ApiProperty({
    isArray: true,
    default: []
  })
  approvals: string[] = []

  // TODO (@wcalderipe, 22/01/24): Test the discrimination type option from
  // class-transformer instead of a custom function map.
  //
  // See https://github.com/typestack/class-transformer?tab=readme-ov-file#working-with-nested-objects
  @ValidateNested()
  @Type((opts) => {
    return opts?.object.request.action === Action.SIGN_TRANSACTION ? SignTransactionRequestDto : SignMessageRequestDto
  })
  @IsDefined()
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDto) }, { $ref: getSchemaPath(SignMessageRequestDto) }]
  })
  request: SignTransactionRequestDto | SignMessageRequestDto

  isSignTransaction(request: SignTransactionRequestDto | SignMessageRequestDto): request is SignTransactionRequestDto {
    return this.request.action === Action.SIGN_TRANSACTION
  }

  isSignMessage(request: SignTransactionRequestDto | SignMessageRequestDto): request is SignMessageRequestDto {
    return this.request.action === Action.SIGN_MESSAGE
  }
}
