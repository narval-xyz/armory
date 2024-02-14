import { AccountClassification, Address } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsEthereumAddress, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class AddressBookAccountDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsEnum(AccountClassification)
  @ApiProperty({
    enum: Object.values(AccountClassification)
  })
  classification: AccountClassification

  @IsEthereumAddress()
  @ApiProperty({
    format: 'address',
    type: String
  })
  address: Address

  @IsNumber()
  @IsDefined()
  @ApiProperty()
  chainId: number
}
