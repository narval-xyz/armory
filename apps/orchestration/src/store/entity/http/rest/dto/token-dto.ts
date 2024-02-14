import { Address } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEthereumAddress, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsDefined()
  @IsEthereumAddress()
  @ApiProperty({
    format: 'address',
    type: String
  })
  address: Address

  @IsNumber()
  @IsDefined()
  @Min(1)
  @ApiProperty()
  chainId: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  symbol: string

  @IsNumber()
  @IsDefined()
  @ApiProperty()
  decimals: number

  constructor(partial: Partial<TokenDto>) {
    Object.assign(this, partial)
  }
}
