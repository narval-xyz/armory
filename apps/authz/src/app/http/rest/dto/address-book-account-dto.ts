import { AccountClassification, Address } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsNumber, IsString } from 'class-validator'
import { AddressBookAccount } from '../../../../shared/types/entities.types'

export class AddressBookAccountDataDto {
  constructor(addressBookAccount: AddressBookAccount) {
    this.uid = addressBookAccount.uid
    this.classification = addressBookAccount.classification
    this.address = addressBookAccount.address
    this.chainId = addressBookAccount.chainId
  }

  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsIn(Object.values(AccountClassification))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(AccountClassification)
  })
  classification: AccountClassification

  @IsString()
  @IsDefined()
  @ApiProperty()
  address: Address

  @IsNumber()
  @IsDefined()
  @ApiProperty()
  chainId: number
}
