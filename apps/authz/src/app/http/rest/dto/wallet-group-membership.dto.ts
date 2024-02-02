import { WalletGroupMembership } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString } from 'class-validator'

export class WalletGroupMembershipDto {
  constructor(data: WalletGroupMembership) {
    this.walletId = data.walletId
    this.groupId = data.groupId
  }

  @IsString()
  @IsDefined()
  @ApiProperty()
  walletId: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  groupId: string
}
