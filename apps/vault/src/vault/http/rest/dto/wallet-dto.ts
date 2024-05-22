import { Hex } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEthereumAddress, IsOptional, IsString } from 'class-validator'
import { publicKeyToAddress } from 'viem/utils'
import { Wallet } from '../../../../../src/shared/type/domain.type'

export class WalletDto {
  constructor({ publicKey, address, id, derivationPath, keyId }: Wallet) {
    this.publicKey = publicKey
    this.derivationPath = derivationPath
    this.address = address || publicKeyToAddress(publicKey)
    this.resourceId = id
    this.keyId = keyId
  }

  @IsString()
  @ApiProperty()
  publicKey: Hex

  @IsString()
  @ApiProperty()
  resourceId: string

  @IsEthereumAddress()
  @ApiProperty()
  address: Hex

  @IsString()
  @IsOptional()
  @ApiProperty()
  keyId?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  derivationPath?: string
}
