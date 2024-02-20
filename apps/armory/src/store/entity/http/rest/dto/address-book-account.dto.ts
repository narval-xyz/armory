import { AccountClassification, Address } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsEthereumAddress, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class AddressBookAccountDto {
  @IsString()
  @IsNotEmpty()
  uid: string

  @IsEnum(AccountClassification)
  @ApiProperty({ enum: AccountClassification })
  classification: AccountClassification

  @IsEthereumAddress()
  @ApiProperty({
    format: 'address',
    type: String
  })
  address: Address

  @IsNumber()
  chainId: number
}
