import { Address, Hex } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsDefined,
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
    format: 'address',
    required: true,
    type: 'string'
  })
  address: Address

  @IsString()
  @ApiProperty({
    format: 'hexadecimal',
    isArray: true,
    required: true,
    type: 'string'
  })
  storageKeys: Hex[]
}

export class TransactionRequestDto {
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
  @IsOptional()
  @Min(0)
  @ApiProperty({
    minimum: 0,
    required: false
  })
  nonce?: number

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

  @IsString()
  @IsOptional()
  @ApiProperty({
    default: '2',
    required: false
  })
  type?: '2'

  @IsString()
  @IsOptional()
  @ApiProperty({
    format: 'hexadecimal',
    required: false,
    type: 'string'
  })
  value?: Hex
}

/**
 * The transformer function in the "@Transformer" decorator for bigint
 * properties differs between the request and response. This variation is due to
 * the limitations of JS' built-in functions, such as JSON, when handling
 * bigints.
 *
 * - Request: The transformer converts from a string to bigint.
 * - Response: The transformer converts from bigint to a string.
 */
export class TransactionResponseDto extends TransactionRequestDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  @ApiProperty({
    type: 'string'
  })
  gas?: bigint
}
