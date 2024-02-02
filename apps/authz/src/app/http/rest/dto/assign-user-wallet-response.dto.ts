import { UserWalletDto } from '@app/authz/app/http/rest/dto/user-wallet.dto'
import { UserWallet } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'

export class AssignUserWalletResponseDto {
  constructor(userWallet: UserWallet) {
    this.data = new UserWalletDto(userWallet)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: UserWalletDto
}
