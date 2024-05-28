import { IsHexString } from '@narval/nestjs-shared'
import { Address, Hex } from '@narval/policy-engine-shared'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
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
  address: Address

  @IsString()
  @IsHexString()
  storageKeys: Hex[]
}

export class TransactionRequestDto {
  @IsInt()
  @Min(1)
  chainId: number

  @IsString()
  @IsDefined()
  @IsEthereumAddress()
  from: Address

  @IsNumber()
  @IsOptional()
  @Min(0)
  nonce?: number

  @Type(() => AccessListDto)
  @ValidateNested({ each: true })
  accessList?: AccessListDto[]

  @IsString()
  @IsOptional()
  data?: Hex

  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  gas?: bigint

  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  maxFeePerGas?: bigint

  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  maxPriorityFeePerGas?: bigint

  @IsString()
  @IsEthereumAddress()
  @IsOptional()
  to?: Address | null

  @IsString()
  @IsOptional()
  type?: '2'

  @IsString()
  @IsOptional()
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
  @ApiPropertyOptional({ type: String })
  gas?: bigint

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  @ApiPropertyOptional({ type: String })
  maxFeePerGas?: bigint

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  @ApiPropertyOptional({ type: String })
  maxPriorityFeePerGas?: bigint
}
