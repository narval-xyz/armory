import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class ImportSeedDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  keyId?: string

  @IsString()
  @ApiProperty()
  encryptedSeed: string
}
