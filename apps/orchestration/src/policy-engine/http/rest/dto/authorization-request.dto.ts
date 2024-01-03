import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Equals, IsEnum, IsString } from 'class-validator'
import { Action, Intent } from '../../../core/type/domain.type'

class SignatureDto {
  @ApiProperty()
  hash: string

  @ApiProperty({
    enum: ['ECDSA']
  })
  type?: string = 'ECDSA'
}

class AuthenticationDto {
  @ApiProperty()
  signature: SignatureDto
}

class ApprovalDto {
  @ApiProperty({
    type: () => SignatureDto,
    isArray: true
  })
  signatures: SignatureDto[]
}

class TransferNativeIntentDto {
  @ApiProperty({
    default: Intent.TRANSFER_NATIVE
  })
  @IsString()
  @Equals(Intent.TRANSFER_NATIVE)
  type: string = Intent.TRANSFER_NATIVE
}

class TransferTokenIntentDto {
  @ApiProperty({
    default: Intent.TRANSFER_TOKEN
  })
  @IsString()
  @Equals(Intent.TRANSFER_TOKEN)
  type: string = Intent.TRANSFER_TOKEN
}

@ApiExtraModels(TransferNativeIntentDto, TransferTokenIntentDto)
class SignTransactionRequestDto {
  @ApiProperty()
  @IsString()
  from: string

  @ApiProperty()
  @IsString()
  to: string

  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(TransferNativeIntentDto) }, { $ref: getSchemaPath(TransferTokenIntentDto) }]
  })
  intent: TransferNativeIntentDto | TransferTokenIntentDto
}

class SignMessageRequestDto {
  @ApiProperty()
  @IsString()
  message: string
}

@ApiExtraModels(SignTransactionRequestDto, SignMessageRequestDto)
export class AuthorizationRequestDto {
  @ApiProperty({
    enum: Action
  })
  @IsEnum(Action)
  action: Action

  @ApiProperty()
  authentication: AuthenticationDto

  @ApiProperty()
  approval: ApprovalDto

  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDto) }, { $ref: getSchemaPath(SignMessageRequestDto) }]
  })
  request: SignTransactionRequestDto | SignMessageRequestDto
}
