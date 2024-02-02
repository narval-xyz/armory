import { WalletGroupMembershipDto } from '@app/authz/app/http/rest/dto/wallet-group-membership.dto'
import { WalletGroupMembership } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'

export class AssignWalletGroupResponseDto {
  constructor(walletGroup: WalletGroupMembership) {
    this.data = new WalletGroupMembershipDto(walletGroup)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: WalletGroupMembershipDto
}
