import { Hex } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { resourceId } from 'packages/armory-sdk/src/lib/utils'
import { WalletDto } from './wallet-dto'

export class GenerateKeyResponseDto {
  constructor({
    publicKey,
    keyId,
    derivationPath,
    backup
  }: {
    publicKey: Hex
    keyId?: string
    derivationPath?: string
    backup?: string
  }) {
    this.backup = backup
    this.keyId = keyId || resourceId(publicKey)
    this.wallet = new WalletDto(publicKey, derivationPath)
  }

  @IsString()
  @ApiProperty()
  keyId: string

  @ApiProperty()
  wallet: WalletDto

  @ApiProperty()
  backup?: string
}
