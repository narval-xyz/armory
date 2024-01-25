import { AccessList, Action, Address, Alg, Caip10Id, FiatCurrency, Hex } from '@narval/authz-shared'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsDefined, IsEnum, IsEthereumAddress, IsOptional, IsString, ValidateNested } from 'class-validator'

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
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Action
  })
  action: Action

  @IsString()
  @IsDefined()
  @ApiProperty()
  nonce: string
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

  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  @ApiProperty({
    format: 'bigint',
    required: false,
    type: 'string'
  })
  gas?: bigint
  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  @ApiProperty({
    format: 'bigint',
    required: false,
    type: 'string'
  })
  maxFeePerGas?: bigint
  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  @ApiProperty({
    format: 'bigint',
    required: false,
    type: 'string'
  })
  maxPriorityFeePerGas?: bigint

  @ApiProperty()
  nonce?: number

  value?: Hex

  chainId: number

  accessList?: AccessList

  type?: '2'
}

export class SignTransactionRequestDataDto extends BaseRequestDataDto {
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Action,
    default: Action.SIGN_TRANSACTION
  })
  action: Action.SIGN_TRANSACTION

  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @ValidateNested()
  @IsDefined()
  @ApiProperty({
    type: TransactionRequestDto
  })
  transactionRequest: TransactionRequestDto
}

export class SignMessageRequestDataDto extends BaseRequestDataDto {
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Action,
    default: Action.SIGN_MESSAGE
  })
  action: Action.SIGN_MESSAGE

  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  message: string // TODO: Is this string hex or raw?
}

export class HistoricalTransferDto {
  amount: string
  from: Caip10Id
  to: string
  chainId: number
  token: string
  rates: { [keyof in FiatCurrency]: string }
  initiatedBy: string
  timestamp: number
}

@ApiExtraModels(SignTransactionRequestDataDto, SignMessageRequestDataDto)
export class EvaluationRequestDto {
  @IsDefined()
  @ApiProperty()
  authentication: RequestSignatureDto

  @IsOptional()
  @ValidateNested()
  @ApiProperty({
    type: () => RequestSignatureDto,
    isArray: true
  })
  approvals?: RequestSignatureDto[]

  @ValidateNested()
  @Type((opts) => {
    return opts?.object.request.action === Action.SIGN_TRANSACTION
      ? SignTransactionRequestDataDto
      : SignMessageRequestDataDto
  })
  @IsDefined()
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDataDto) }, { $ref: getSchemaPath(SignMessageRequestDataDto) }]
  })
  request: SignTransactionRequestDataDto | SignMessageRequestDataDto

  @IsOptional()
  @ValidateNested()
  @ApiProperty()
  transfers?: HistoricalTransferDto[]
}
