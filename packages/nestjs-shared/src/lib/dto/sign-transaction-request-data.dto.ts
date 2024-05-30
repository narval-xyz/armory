import { Action, Address, Hex } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsDefined, IsEthereumAddress, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator'
import { IsHexString } from '../decorator/is-hex-string.decorator'
import { BaseActionDto } from './'

class AccessListDto {
  @IsString()
  @IsDefined()
  @IsEthereumAddress()
  address: Address

  @IsString()
  @IsHexString()
  storageKeys: Hex[]
}

export class TransactionRequestDto {
  @IsString()
  @IsDefined()
  @IsEthereumAddress()
  @ApiProperty({
    required: true,
    format: 'EthereumAddress'
  })
  from: Address

  @IsString()
  @IsEthereumAddress()
  @ApiProperty({
    format: 'EthereumAddress'
  })
  to?: Address | null

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: 'string',
    format: 'Hexadecimal'
  })
  data?: Hex

  @IsOptional()
  @ApiProperty({
    format: 'bigint',
    required: false,
    type: 'string'
  })
  @Transform(({ value }) => BigInt(value))
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

  @IsHexString()
  @IsOptional()
  value?: Hex

  @IsInt()
  @Min(1)
  chainId: number

  @Type(() => AccessListDto)
  @ValidateNested({ each: true })
  accessList?: AccessListDto[]

  @IsString()
  @IsOptional()
  type?: '2'
}

export class SignTransactionRequestDataDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.SIGN_TRANSACTION
  })
  action: typeof Action.SIGN_TRANSACTION

  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @ApiProperty({
    type: TransactionRequestDto
  })
  @IsDefined()
  @Type(() => TransactionRequestDto)
  @ValidateNested()
  transactionRequest: TransactionRequestDto
}
