import { UserWallet } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'
import { UserWalletDto } from './user-wallet.dto'

export class AssignUserWalletResponseDto {
  constructor(userWallet: UserWallet) {
    this.data = new UserWalletDto(userWallet)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: UserWalletDto
}
