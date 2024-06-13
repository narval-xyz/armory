import { IsHexString } from '@narval/nestjs-shared'
import { Hex } from '@narval/policy-engine-shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class ImportPrivateKeyDto {
  @IsHexString()
  @IsOptional()
  @ApiProperty({
    description: 'Wallet Private Key, unencrypted'
  })
  privateKey?: Hex

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Wallet Private Key encrypted with JWE. Header MUST include `kid`'
  })
  encryptedPrivateKey?: string

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  _OLD_WALLET_Id?: string // If not provided, it will be derived as `eip155:eoa:${address}:`
}
