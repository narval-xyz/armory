import { AccountType, Address } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsNumber, IsOptional, IsString } from 'class-validator'
import { Wallet } from '../../../../shared/types/entities.types'

export class WalletDataDto {
  constructor(wallet: Wallet) {
    this.uid = wallet.uid
    this.accountType = wallet.accountType
    this.address = wallet.address
    this.chainId = wallet.chainId
  }

  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsIn(Object.values(AccountType))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(AccountType)
  })
  accountType: AccountType

  @IsString()
  @ApiProperty()
  address: Address

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  chainId?: number
}
