import { WalletGroupMembership } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'
import { WalletGroupMembershipDto } from './wallet-group-membership.dto'

export class AssignWalletGroupResponseDto {
  constructor(walletGroup: WalletGroupMembership) {
    this.data = new WalletGroupMembershipDto(walletGroup)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: WalletGroupMembershipDto
}
