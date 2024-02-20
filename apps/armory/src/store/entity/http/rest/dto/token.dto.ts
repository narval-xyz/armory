import { Address } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEthereumAddress, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  uid: string

  @IsEthereumAddress()
  @ApiProperty({
    format: 'address',
    type: String
  })
  address: Address

  @IsNumber()
  @IsDefined()
  @Min(1)
  chainId: number

  @IsString()
  @IsNotEmpty()
  symbol: string

  @IsNumber()
  @IsDefined()
  decimals: number

  constructor(partial: Partial<TokenDto>) {
    Object.assign(this, partial)
  }
}
