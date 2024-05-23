import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { Wallet } from '../../../../shared/type/domain.type'

type DerivationPath = `m/44'/60'/${string}` | 'next'
export class DeriveWalletDto {
  constructor(keyId: string, derivationPaths: DerivationPath[] = ['next']) {
    this.keyId = keyId
    this.derivationPaths = derivationPaths
  }

  @ApiProperty()
  @IsString()
  keyId: string

  @ApiProperty()
  derivationPaths: DerivationPath[]
}

export class DeriveWalletResponseDto {
  constructor(wallets: Wallet[] | Wallet) {
    this.wallets = wallets
  }

  @ApiProperty()
  wallets: Wallet[] | Wallet
}
