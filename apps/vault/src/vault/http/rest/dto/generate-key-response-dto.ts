import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { Wallet } from '../../../../shared/type/domain.type'
import { WalletDto } from './wallet-dto'

export class GenerateKeyResponseDto {
  constructor({ wallet, rootKeyId, backup }: { wallet: Wallet; rootKeyId: string; backup?: string }) {
    this.backup = backup
    this.keyId = rootKeyId
    this.wallet = new WalletDto(wallet)
  }

  @IsString()
  @ApiProperty()
  keyId: string

  @ApiProperty()
  wallet: WalletDto

  @ApiProperty()
  backup?: string
}
