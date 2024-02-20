import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { AddressBookAccountDto } from './address-book-account.dto'
import { CredentialDto } from './credential.dto'
import { TokenDto } from './token.dto'
import { UserGroupMemberDto } from './user-group-member.dto'
import { UserGroupDto } from './user-group.dto'
import { UserWalletDto } from './user-wallet.dto'
import { UserDto } from './user.dto'
import { WalletGroupMemberDto } from './wallet-group-member.dto'
import { WalletGroupDto } from './wallet-group.dto'
import { WalletDto } from './wallet.dto'

export class EntitiesDto {
  @IsDefined()
  @Type(() => AddressBookAccountDto)
  @ValidateNested({ each: true })
  addressBook: AddressBookAccountDto[]

  @IsDefined()
  @Type(() => CredentialDto)
  @ValidateNested({ each: true })
  credentials: CredentialDto[]

  @IsDefined()
  @Type(() => TokenDto)
  @ValidateNested({ each: true })
  tokens: TokenDto[]

  @IsDefined()
  @Type(() => UserDto)
  @ValidateNested({ each: true })
  users: UserDto[]

  @IsDefined()
  @Type(() => UserGroupDto)
  @ValidateNested({ each: true })
  userGroups: UserGroupDto[]

  @IsDefined()
  @Type(() => UserGroupMemberDto)
  @ValidateNested({ each: true })
  userGroupMembers: UserGroupMemberDto[]

  @IsDefined()
  @Type(() => UserWalletDto)
  @ValidateNested({ each: true })
  userWallets: UserWalletDto[]

  @IsDefined()
  @Type(() => WalletDto)
  @ValidateNested({ each: true })
  wallets: WalletDto[]

  @IsDefined()
  @Type(() => WalletGroupDto)
  @ValidateNested({ each: true })
  walletGroups: WalletGroupDto[]

  @IsDefined()
  @Type(() => WalletGroupMemberDto)
  @ValidateNested({ each: true })
  walletGroupMembers: WalletGroupMemberDto[]

  constructor(partial: Partial<EntitiesDto>) {
    Object.assign(this, partial)
  }
}
