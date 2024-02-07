import { Token } from '@app/authz/shared/types/entities.types'
import { Address } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNumber, IsString } from 'class-validator'

export class TokenDataDto {
  constructor(token: Token) {
    this.uid = token.uid
    this.address = token.address
    this.chainId = token.chainId
    this.symbol = token.symbol
    this.decimals = token.decimals
  }

  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  address: Address

  @IsNumber()
  @IsDefined()
  @ApiProperty()
  chainId: number

  @IsString()
  @IsDefined()
  @ApiProperty()
  symbol: string

  @IsNumber()
  @IsDefined()
  @ApiProperty()
  decimals: number
}
