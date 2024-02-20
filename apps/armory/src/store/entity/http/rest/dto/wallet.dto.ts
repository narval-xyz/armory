import { AccountType, Address } from '@narval/policy-engine-shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsEthereumAddress, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class WalletDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsEnum(AccountType)
  @ApiProperty({ enum: AccountType })
  accountType: AccountType

  @IsEthereumAddress()
  @ApiProperty({
    type: String,
    format: 'address'
  })
  address: Address

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  chainId?: number

  constructor(partial: Partial<WalletDto>) {
    Object.assign(this, partial)
  }
}
