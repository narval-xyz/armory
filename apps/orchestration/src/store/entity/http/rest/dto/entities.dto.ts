import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { AddressBookAccountDto } from './address-book-account.dto'
import { AuthCredentialDto } from './auth-credential.dto'
import { TokenDto } from './token.dto'
import { UserWalletDto } from './user-wallet.dto'
import { UserDto } from './user.dto'
import { WalletGroupDto } from './wallet-group.dto'
import { WalletDto } from './wallet.dto'

export class EntitiesDto {
  @Type(() => AddressBookAccountDto)
  @ValidateNested({ each: true })
  addressBook: AddressBookAccountDto[]

  @Type(() => AuthCredentialDto)
  @ValidateNested({ each: true })
  credentials: AuthCredentialDto[]

  @Type(() => TokenDto)
  @ValidateNested({ each: true })
  tokens: TokenDto[]

  @Type(() => UserDto)
  @ValidateNested({ each: true })
  users: UserDto[]

  @Type(() => UserWalletDto)
  @ValidateNested({ each: true })
  userWallets: UserWalletDto[]

  @Type(() => WalletDto)
  @ValidateNested({ each: true })
  wallets: WalletDto[]

  @Type(() => WalletDto)
  @ValidateNested({ each: true })
  walletGroups: WalletGroupDto[]

  constructor(partial: Partial<EntitiesDto>) {
    Object.assign(this, partial)
  }
}
