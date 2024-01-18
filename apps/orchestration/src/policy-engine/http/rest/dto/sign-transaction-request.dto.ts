import { Address, Hex, TransactionType } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsDefined,
  IsEnum,
  IsEthereumAddress,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator'

class AccessListDto {
  @IsString()
  @IsDefined()
  @IsEthereumAddress()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    format: 'Address',
    required: true,
    type: 'string'
  })
  address: Address

  @IsString()
  @ApiProperty({
    format: 'Hexadecimal',
    isArray: true,
    required: true,
    type: 'string'
  })
  storageKeys: Hex[]
}

export class SignTransactionRequestDto {
  @IsInt()
  @Min(1)
  @ApiProperty({
    minimum: 1
  })
  chainId: number

  @IsString()
  @IsDefined()
  @IsEthereumAddress()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    format: 'address',
    type: 'string'
  })
  from: Address

  @IsNumber()
  @Min(0)
  @ApiProperty({
    minimum: 0
  })
  nonce: number

  @IsOptional()
  @ValidateNested()
  @ApiProperty({
    isArray: true,
    required: false,
    type: AccessListDto
  })
  accessList?: AccessListDto[]

  @IsString()
  @IsOptional()
  @ApiProperty({
    format: 'hexadecimal',
    required: false,
    type: 'string'
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

  @IsString()
  @IsEthereumAddress()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    format: 'address',
    required: false,
    type: 'string'
  })
  to?: Address | null

  @IsEnum(TransactionType)
  @IsOptional()
  @ApiProperty({
    enum: TransactionType,
    required: false
  })
  type?: `${TransactionType}`

  @IsString()
  @IsOptional()
  @ApiProperty({
    format: 'hexadecimal',
    required: false,
    type: 'string'
  })
  value?: Hex
}
