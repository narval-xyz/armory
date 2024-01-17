import { Action, Address, Hex } from '@app/orchestration/policy-engine/core/type/domain.type'
import { SignatureDto } from '@app/orchestration/policy-engine/http/rest/dto/signature.dto'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsDefined, IsEnum, IsEthereumAddress, IsString, Validate, ValidateNested } from 'class-validator'
import { RequestHash } from './validator/request-hash.validator'

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

export class SignTransactionRequestDto {
  @IsString()
  @IsDefined()
  @IsEthereumAddress()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    required: true,
    format: 'EthereumAddress'
  })
  from: Address

  @IsString()
  @IsEthereumAddress()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    format: 'EthereumAddress'
  })
  to?: Address | null

  @IsString()
  @ApiProperty({
    type: 'string',
    format: 'Hexadecimal'
  })
  data?: Hex

  @Transform(({ value }) => BigInt(value))
  @ApiProperty({
    type: 'string'
  })
  gas?: bigint
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
