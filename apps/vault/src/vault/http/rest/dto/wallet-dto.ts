import { Hex } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEthereumAddress, IsString } from 'class-validator'
import { resourceId } from 'packages/armory-sdk/src/lib/utils'
import { publicKeyToAddress } from 'viem/utils'
import { buildDerivePath } from '../../../core/utils/key-generation'

export class WalletDto {
  constructor(publicKey: Hex, derivationPath?: string, resourceIdValue?: string, address?: Hex) {
    this.publicKey = publicKey
    this.derivationPath = derivationPath || buildDerivePath({})
    this.address = address || publicKeyToAddress(publicKey)
    this.resourceId = resourceIdValue || resourceId(this.address)
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
  @ApiProperty()
  derivationPath: string
}
