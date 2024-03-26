import { IsHexString } from '@narval/nestjs-shared'
import { Hex } from '@narval/policy-engine-shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class ImportPrivateKeyDto {
  @IsHexString()
  @ApiProperty()
  privateKey: Hex

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  walletId?: string // If not provided, it will be derived as `eip155:eoa:${address}:`
}
