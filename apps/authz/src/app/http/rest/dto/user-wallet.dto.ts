import { UserWallet } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString } from 'class-validator'

export class UserWalletDto {
  constructor(data: UserWallet) {
    this.userId = data.userId
    this.walletId = data.walletId
  }

  @IsString()
  @IsDefined()
  @ApiProperty()
  walletId: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  userId: string
}
