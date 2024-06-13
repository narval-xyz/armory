import { IsHexString } from '@narval/nestjs-shared'
import { Hex } from '@narval/policy-engine-shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class ImportPrivateKeyDto {
  @IsHexString()
  @IsOptional()
  @ApiProperty({
    description: 'Account Private Key, unencrypted'
  })
  privateKey?: Hex

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Account Private Key encrypted with JWE. Header MUST include `kid`'
  })
  encryptedPrivateKey?: string

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  accountId?: string // If not provided, it will be derived as `eip155:eoa:${address}:`
}
