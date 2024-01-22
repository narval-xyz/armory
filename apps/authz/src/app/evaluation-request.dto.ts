import { AccessList, Action, Address, Alg, FiatSymbols, Hex } from '@app/authz/shared/types/domain.type'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsDefined, IsEnum, IsEthereumAddress, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Caip10 } from 'packages/transaction-request-intent/src/lib/caip'

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

export class HistoricalTransferDto {
  amount: string // Amount in the smallest unit of the token (eg. wei for ETH)
  from: Caip10
  to: Caip10 // In case we want spending limit per destination address
  chainId: number
  token: Caip10
  rates: { [keyof in FiatSymbols]: string } // eg. { fiat:usd: '0.01', fiat:eur: '0.02' }
  initiatedBy: string // uid of the user who initiated the spending
  timestamp: number // unix timestamp
}

@ApiExtraModels(SignTransactionRequestDataDto, SignMessageRequestDataDto)
export class EvaluationRequestDto {
  @IsDefined()
  @ApiProperty()
  authentication: RequestSignatureDto

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

  @ValidateNested()
  @ApiProperty()
  transfers?: HistoricalTransferDto[]

  isSignTransaction(
    request: SignTransactionRequestDataDto | SignMessageRequestDataDto
  ): request is SignTransactionRequestDataDto {
    return this.request.action === Action.SIGN_TRANSACTION
  }

  isSignMessage(
    request: SignTransactionRequestDataDto | SignMessageRequestDataDto
  ): request is SignMessageRequestDataDto {
    return this.request.action === Action.SIGN_MESSAGE
  }
}
