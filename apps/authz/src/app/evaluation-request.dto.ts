import { Actions, Alg } from '@app/authz/shared/types/enums'
import { Address, Hex } from '@app/authz/shared/types/http'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsDefined, IsEnum, IsEthereumAddress, IsString, ValidateNested } from 'class-validator'

export class RequestSignatureDto {
  @ApiProperty()
  @IsString()
  sig: string

  @IsEnum(Alg)
  @ApiProperty({ enum: Alg })
  alg: Alg

  @ApiProperty()
  @IsString()
  pubKey: string
}

export class BaseRequestDataDto {
  @IsEnum(Actions)
  @IsDefined()
  @ApiProperty({
    enum: Actions
  })
  action: Actions
}

export class TransactionRequestDto {
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

  gas: Hex

  @ApiProperty()
  nonce?: number

  value?: Hex

  chainId: string

  accessList?: { address: Address; storageKeys: Hex[] }[]

  type?: "2"
}

export class SignTransactionRequestDataDto extends BaseRequestDataDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @ValidateNested()
  @Type(() => TransactionRequestDto)
  @IsDefined()
  @ApiProperty({
    type: TransactionRequestDto
  })
  transactionRequest: TransactionRequestDto
}

export class SignMessageRequestDataDto extends BaseRequestDataDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  message: string // TODO: Is this string hex or raw?
}

@ApiExtraModels(SignTransactionRequestDataDto, SignMessageRequestDataDto)
export class EvaluationRequestDto {
  @ApiProperty()
  authentication: RequestSignatureDto

  @ApiProperty({
    type: () => RequestSignatureDto,
    isArray: true
  })
  approvals: RequestSignatureDto[]

  @ValidateNested()
  @Type((opts) => {
    return opts?.object.action === Actions.SIGN_TRANSACTION ? TransactionRequestDto : SignMessageRequestDataDto
  })
  @IsDefined()
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDataDto) }, { $ref: getSchemaPath(SignMessageRequestDataDto) }]
  })
  request: SignTransactionRequestDataDto | SignMessageRequestDataDto

  isSignTransaction(
    request: SignTransactionRequestDataDto | SignMessageRequestDataDto
  ): request is SignTransactionRequestDataDto {
    return this.request.action === Actions.SIGN_TRANSACTION
  }

  isSignMessage(
    request: SignTransactionRequestDataDto | SignMessageRequestDataDto
  ): request is SignMessageRequestDataDto {
    return this.request.action === Actions.SIGN_MESSAGE
  }
}
