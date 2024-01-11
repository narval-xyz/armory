import { Action, Address, Hex } from '@app/orchestration/policy-engine/core/type/domain.type'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, IsEthereumAddress, IsString, Validate, ValidateNested } from 'class-validator'
import { RequestHash } from './validator/request-hash.validator'

export class SignatureDto {
  @IsDefined()
  @IsString()
  @ApiProperty()
  hash: string

  @ApiProperty({
    enum: ['ECDSA']
  })
  type?: string = 'ECDSA'
}

export class AuthenticationDto {
  @ApiProperty()
  signature: SignatureDto
}

export class ApprovalDto {
  @ApiProperty({
    type: () => SignatureDto,
    isArray: true
  })
  signatures: SignatureDto[]
}

export class SignTransactionRequestDto {
  @IsDefined()
  @IsEthereumAddress()
  @ApiProperty({
    required: true,
    format: 'EthereumAddress'
  })
  from: Address

  @IsEthereumAddress()
  @ApiProperty({
    format: 'EthereumAddress'
  })
  to: Address

  @IsString()
  @ApiProperty({
    type: 'string',
    format: 'Hexadecimal'
  })
  data: Hex
}

export class SignMessageRequestDto {
  @IsString()
  @IsDefined()
  @ApiProperty({
    required: true
  })
  message: string
}

@ApiExtraModels(SignTransactionRequestDto, SignMessageRequestDto)
export class AuthorizationRequestDto {
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Action
  })
  action: `${Action}`

  @ApiProperty()
  authentication: AuthenticationDto

  @ApiProperty()
  approval: ApprovalDto

  @ValidateNested()
  @Type((opts) => {
    return opts?.object.action === Action.SIGN_TRANSACTION ? SignTransactionRequestDto : SignMessageRequestDto
  })
  @IsDefined()
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDto) }, { $ref: getSchemaPath(SignMessageRequestDto) }]
  })
  request: SignTransactionRequestDto | SignMessageRequestDto

  @IsString()
  @IsDefined()
  @Validate(RequestHash)
  @ApiProperty({
    description: 'The hash of the request in EIP-191 format.',
    required: true
  })
  hash: string

  isSignTransaction(request: SignTransactionRequestDto | SignMessageRequestDto): request is SignTransactionRequestDto {
    return this.action === Action.SIGN_TRANSACTION
  }

  isSignMessage(request: SignTransactionRequestDto | SignMessageRequestDto): request is SignMessageRequestDto {
    return this.action === Action.SIGN_MESSAGE
  }
}
