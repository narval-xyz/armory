import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class WalletGroupDto {
  @IsString()
  @IsNotEmpty()
  uid: string

  @IsArray()
  wallets: string[]

  constructor(partial: Partial<WalletGroupDto>) {
    Object.assign(this, partial)
  }
}
