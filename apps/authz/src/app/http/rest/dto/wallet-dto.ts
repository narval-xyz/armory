import { AccountType } from '@app/authz/shared/types/domain.type'
import { Wallet } from '@app/authz/shared/types/entities.types'
import { Address } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

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

  @IsEnum(AccountType)
  @IsDefined()
  @ApiProperty({
    enum: AccountType
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
